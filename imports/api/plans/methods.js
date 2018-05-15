import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Check } from 'meteor/check';
import moment from 'moment';

import { 
  Plans
} from './plans.js';

import { 
  Items
} from '../items/items.js';


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
  run({ item_id, item_name, price, percent_off, quantity, frequency, tax_percent }) {

  	const newPlan = { 
		  item_id,
      item_name,
      price,
		  created_at: new Date(),
		  canceled_at: null,
		  percent_off: percent_off || 5,
		  quantity: quantity || 1,
		  frequency: frequency || 7,
		  tax_percent: tax_percent || 8.875,
    };

    const planId = Plans.insert(newPlan);
    var result = Plans.findOne({_id: planId});
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
  run({ plan_id, user_id }) {

    const user = Meteor.users.findOne({ _id: user_id});
    var plan = Plans.findOne({_id: plan_id});

    plan.status = 'active';
    plan.subscribed_at = new Date();

    var subscriptions = user.subscriptions;

    if (subscriptions) {
      subscriptions.push(plan);
    } else {
      subscriptions = [plan];
    };

    Meteor.users.update(user_id, {
      $set: {
        subscriptions: subscriptions
      }
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
  run({ item_id, discount, quantity, frequency }) {
    const selector = {
      "item_id": item_id,
      "quantity": quantity,
      "frequency": frequency,
    };

    console.log( selector );
  	var planExists = Plans.find(selector).fetch();

  	return planExists;
  },
});

// Get list of all method names on plans
const Plans_METHODS = _.pluck([
  insertPlan,
  checkForPlan,
  subscribeToPlan,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(Plans_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}