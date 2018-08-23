import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { moment } from 'meteor/momentjs:moment';

import { Slots } from './slots.js';
import { Items } from '/imports/api/items/items.js';
import { Orders } from '/imports/api/orders/orders.js';
// import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

// Methods

// Call from server only

// Call from client

export const insertSlot = new ValidatedMethod({
  name: 'Slots.insert',
  validate: new SimpleSchema({
    user_id: { type: String },
    sub_id: { type: String },
    category: { type: String },
    restrictions: { type: Array },
    'restrictions.$': { type: String, optional: true },
    static: { type: Boolean, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id: userId,
    sub_id: subId,
    category,
    restrictions,
    static,
  }) {
    const slot = {
      created_at: new Date(),
      user_id: userId,
      sub_id: subId,
      category,
      restrictions,
      static: static || false,
    };

    Slots.insert(slot);
  },
});

// Get list of all method names on orders
const SLOTS_METHODS = _.pluck([
  insertSlot,
], 'name');

if (Meteor.isServer) {

  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(SLOTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 25, 1000);
}
