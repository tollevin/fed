import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { makeAmbassadorPromo } from '/imports/utils/make_promo.js';

import { Promos } from './promos.js';
import { hasMadePurchase } from '../orders/orders.js';

export const insertPromo = new ValidatedMethod({
  name: 'Meteor.insertPromo',
  validate: new SimpleSchema({
    codes: { type: [String] },
    desc: { type: String },
    credit: { type: Number, optional: true },
    percentage: { type: Number, optional: true },
    expires: { type: String, optional: true },
    useLimitPerCustomer: { type: Number },
    useLimitTotal: { type: Number, optional: true },
    timesUsed: { type: Number, optional: true },
    users: { type: Object, optional: true },
    active: { type: Boolean, optional: true },
    referrer: { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    codes,
    desc,
    credit,
    percentage,
    expires,
    useLimitPerCustomer,
    useLimitTotal,
    referrer,
  }) {
    const promos = codes.map((code) => {
      const promo = {
        code,
        createdAt: new Date(),
        desc,
        credit,
        percentage,
        expires,
        useLimitPerCustomer,
        useLimitTotal,
        timesUsed: 0,
        users: {},
        active: true,
        referrer,
      };

      const promoId = Promos.insert(promo);
      return Promos.findOne({ _id: promoId });
    });

    return promos;
  },
});

const REFERRER_CREDIT = 5; // dollars

export const createEmailPromos = new ValidatedMethod({
  name: 'Meteor.createEmailPromos',
  validate: new SimpleSchema({
    emails: { type: [String] },
    userId: { type: String },
    credit: { type: Number, optional: true },
  }).validator(),
  run(req) {
    const { emails, userId, credit: reqCredit } = req;
    const user = Meteor.users.findOne({ _id: userId });
    let promo = Promos.findOne({ referrer: userId });

    // 5 dollars? // is it a percentage?
    const credit = promo ? promo.credit : (reqCredit || REFERRER_CREDIT);
    const code = promo ? promo.code : makeAmbassadorPromo();

    if (!promo) {
      promo = {
        codes: [code],
        desc: `User ${user.email}'s referral code`,
        credit,
        useLimitPerCustomer: 1,
        useLimitTotal: Number.MAX_SAFE_INTEGER,
        timesUsed: 0,
        active: true,
        users: {},
        referrer: userId,
      };

      insertPromo.call(promo);
    }

    const res = emails
      // don't allow referring self
      .filter(email => email !== user.email)
      .filter((email) => {
        // needs to not send email to someone who has made a purchase
        const referredUser = Meteor.users.findOne({ email });
        const userHasPurchase = referredUser && hasMadePurchase(referredUser._id);
        return !userHasPurchase;
      })
      .map((email) => {
        Meteor.call('sendGiftToUserViaEmail', {
          recipientEmail: email,
          value: credit * 100,
          code,
          customerFirstName: user.email,
          message: 'Enjoy your Referral',
          cardType: 'Referral Coupon Code',
        }, () => {});

        return promo;
      });

    return res;
  },
});

export const retrievePromo = new ValidatedMethod({
  name: 'Meteor.retrievePromo',
  validate: new SimpleSchema({
    code: { type: String },
  }).validator(),
  run({ code }) {
    return Promos.findOne({ code });
  },
});

export const removePromo = new ValidatedMethod({
  name: 'Promos.methods.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Promos.remove(_id);
  },
});

// Get list of all method names on orders
const PROMOS_METHODS = _.pluck([
  insertPromo,
  retrievePromo,
  removePromo,
  createEmailPromos,
], 'name');

if (Meteor.isServer) {
  Meteor.methods({
    usePromo: ({ code, userId }) => {
      const promo = Promos.findOne({ code });

      // In the case where a promo can be used by many users, more than once,
      // if a user has reached useLimitPerCustomer, return an Error (FIX!)
      promo.users[userId] = promo.users[userId] || 0;
      promo.users[userId] += 1;

      promo.timesUsed += 1; // Add a new time used

      // If the promo has now reached useLimitTotal, deactivate
      if (promo.timesUsed === promo.useLimitTotal) {
        promo.active = false;
      }

      switch (promo.type) {
        case 'referral':
          const referrerUser = Meteor.users.findOne({ _id: promo.referrer });
          const referrerCredit = (referrerUser.credit || 0) + REFERRER_CREDIT;
          Meteor.users.update(referrerUser._id, { $set: { credit: referrerCredit } });
          break;
        case 'ambassador':
          const referreeUser = Meteor.users.findOne({ _id: userId });
          if (!referreeUser.referrer) {
            Meteor.users.update(referreeUser._id, { $set: { referrer: promo.referrer } });
          }
          break;
        // case 'gift':
        //   break;
        // default:
        //   break;
      }

      // Update promo
      const updatedPromo = Promos.update(promo._id, {
        $set: promo,
      });

      return updatedPromo;
    },
  });

  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(PROMOS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
