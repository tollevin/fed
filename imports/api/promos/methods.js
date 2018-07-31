import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import makeGiftCardCode from '/imports/utils/make_gift_card_code.js';

import { Promos } from './promos.js';

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
    referredEmail: { type: String, optional: true },
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
    referredEmail,
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
        referredEmail,
      };

      const promoId = Promos.insert(promo);
      return Promos.findOne({ _id: promoId });
    });

    return promos;
  },
});

export const createEmailPromos = new ValidatedMethod({
  name: 'Meteor.createEmailPromos',
  validate: new SimpleSchema({
    emails: { type: [String] },
    userId: { type: String },
  }).validator(),
  run(req) {
    const { emails, userId } = req;
    const user = Meteor.users.findOne({ _id: userId });
    const referredPromos = Promos.find({ referrer: userId }).fetch();

    const allUserReferredEmail = referredPromos.map(({ referredEmail }) => (referredEmail));
    const res = emails
      // don't allow referring self
      .filter(email => email !== user.email)
      // don't allow referring same person multiple times
      .filter(email => !allUserReferredEmail.find(referredEmail => email === referredEmail))
      .map((email) => {
        const credit = 5; // 5 dollars? // is it a percentage?
        const code = makeGiftCardCode();

        const promo = {
          codes: [code],
          desc: `Fed Gift Card for ${email}`,
          credit,
          useLimitPerCustomer: 1,
          useLimitTotal: 1,
          timesUsed: 0,
          active: true,
          users: {},
          referrer: userId,
          referredEmail: email, // this is userId not email.  Does not exist yet
        };

        insertPromo.call(promo); // this is ineffecient... do this for now though

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

export const usePromo = new ValidatedMethod({
  name: 'Meteor.usePromo',
  validate: new SimpleSchema({
    code: { type: String },
  }).validator(),
  run({ code }) {
    const promo = Promos.findOne({ code });
    const user = Meteor.userId();

    // In the case where a promo can be used by many users, more than once,
    // if a user has reached useLimitPerCustomer, return an Error (FIX!)
    promo.users[user] = promo.users[user] || 0;
    promo.users[user] += 1;

    promo.timesUsed += 1; // Add a new time used

    // If the promo has now reached useLimitTotal, deactivate
    if (promo.timesUsed === promo.useLimitTotal) {
      promo.active = false;
    }

    // Update promo
    const updatedPromo = Promos.update(promo._id, {
      $set: promo,
    });

    return updatedPromo;
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
  usePromo,
  removePromo,
  createEmailPromos,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(PROMOS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
