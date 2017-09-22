import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Check } from 'meteor/check';

import { 
  Promos
} from './promos.js';

export const insertPromo = new ValidatedMethod({
  name: 'Meteor.insertPromo',
  validate: new SimpleSchema({
    codes: { type: [ String ] },
    desc: { type: String },
    credit: { type: Number, optional: true },
    percentage: { type: Number, optional: true },
    expires: { type: String, optional: true },
    useLimitPerCustomer: { type: Number },
    useLimitTotal: { type: Number, optional: true },
    timesUsed: { type: Number },
    users: { type: Object },
    active: { type: Boolean },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ codes, desc, credit, percentage, expires, useLimitPerCustomer, useLimitTotal, timesUsed, users, active }) {
    var promos = []
    for (var i = 0; i < codes.length; i++) {
      const code = codes[i];

      const promo = {
        code,
        createdAt: new Date(),
        desc,
        credit,
        percentage,
        expires,
        useLimitPerCustomer,
        useLimitTotal,
        timesUsed,
        users,
        active
      };
    
      const promoId = Promos.insert(promo);
      const result = Promos.findOne({_id: promoId});
      promos.push(result);
    }
    
    return promos;
  },
});

// export const updatePromo = new ValidatedMethod({
//   name: 'Meteor.updatePromo',
//   validate: new SimpleSchema({
//     _id: { type: String },
//     codes: { type: [ String ] },
//     desc: { type: String },
//     credit: { type: Number, optional: true },
//     percentage: { type: Number, optional: true },
//     expires: { type: String, optional: true },
//     useLimitPerCustomer: { type: Number },
//     useLimitTotal: { type: Number, optional: true },
//     timesUsed: { type: Number },
//     users: { type: Object },
//     active: { type: Boolean },
//   }).validator(),
//   run({ _id }) {
//     Promos.remove(_id);
//   },
// });

export const retrievePromo = new ValidatedMethod({
  name: 'Meteor.retrievePromo',
  validate: new SimpleSchema({
    code: { type: String },
  }).validator(),
  run({ code }) {
    var promo = Promos.findOne({code: code});
    console.log(promo);
    return promo;
  },
});

export const usePromo = new ValidatedMethod({
  name: 'Meteor.usePromo',
  validate: new SimpleSchema({
    code: { type: String },
  }).validator(),
  run({ code }) {
    var promo = Promos.findOne({code: code});
    const user = Meteor.userId();
    promo.timesUsed = promo.timesUsed + 1;

    if (promo.users[user]) {
      promo.users[user] = promo.users[user] + 1;
    } else {
      promo.users[user] = 1;
    };

    // if (promo.users[user] === useLimitPerCustomer) {
    //   promo.active = false;
    // };

    if (promo.timesUsed === useLimitTotal) {
      promo.active = false;
    };
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
const Promos_METHODS = _.pluck([
  insertPromo,
  retrievePromo,
  usePromo,
  removePromo,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(Promos_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
