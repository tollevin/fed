import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Plans } from './plans.js';

// Call from server only

// Call from client
export const insertPlan = new ValidatedMethod({
  name: 'Plans.insert',
  validate: new SimpleSchema({
    item_id: { type: String },
    item_name: { type: String, optional: true },
    price: { type: Number, decimal: true, optional: true },
    percent_off: { type: Number, optional: true },
    quantity: { type: Number, optional: true },
    frequency: { type: Number, optional: true },
    tax_percent: { type: Number, decimal: true, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    item_id: itemId,
    item_name: itemName,
    price,
    percent_off: percentOff,
    quantity,
    frequency,
    tax_percent: taxPercent,
  }) {
    const newPlan = {
      item_id: itemId,
      item_name: itemName,
      price,
      created_at: new Date(),
      canceled_at: null,
      percent_off: percentOff || 5,
      quantity: quantity || 1,
      frequency: frequency || 7,
      tax_percent: taxPercent || 8.875,
    };

    const planId = Plans.insert(newPlan);
    const result = Plans.findOne({ _id: planId });
    result.status = 'pending';

    return result;
  },
});

export const subscribeToPlan = new ValidatedMethod({
  name: 'Plans.subscribe',
  validate: new SimpleSchema({
    plan_id: { type: String },
    user_id: { type: String },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ plan_id: planId, user_id: userId }) {
    const user = Meteor.users.findOne({ _id: userId });
    const plan = Plans.findOne({ _id: planId });

    plan.status = 'active';
    plan.subscribed_at = new Date();

    let { subscriptions } = user;

    subscriptions = subscriptions || [];
    subscriptions.push(plan);

    Meteor.users.update(userId, {
      $set: {
        subscriptions,
      },
    });
  },
});

export const checkForPlan = new ValidatedMethod({
  name: 'Plans.check',
  validate: new SimpleSchema({
    item_id: { type: String },
    // discount: { type: Number, optional: true },
    quantity: { type: Number },
    frequency: { type: Number },
    // tax_percent: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ item_id: itemId, quantity, frequency }) {
    const selector = { item_id: itemId, quantity, frequency };

    return Plans.find(selector).fetch();
  },
});

// Get list of all method names on plans
const PLANS_METHODS = _.pluck([
  insertPlan,
  checkForPlan,
  subscribeToPlan,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(PLANS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
