import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Slots } from './slots.js';
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
    is_static: { type: Boolean, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id: userId,
    sub_id: subId,
    category,
    restrictions,
    is_static: isStatic,
  }) {
    const slot = {
      created_at: new Date(),
      user_id: userId,
      sub_id: subId,
      category,
      restrictions,
      is_static: isStatic || false,
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
