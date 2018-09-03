import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { StaticSlots } from './static-slots.js';
// import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

// Methods

// Call from server only

// Call from client

export const insertStaticSlot = new ValidatedMethod({
  name: 'StaticSlots.insert',
  validate: new SimpleSchema({
    slot_id: { type: String },
    item_id: { type: String },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    slot_id: slotId,
    item_id: itemId,
  }) {
    const staticSlot = {
      created_at: new Date(),
      slot_id: slotId,
      item_id: itemId,
    };

    StaticSlots.insert(staticSlot);
  },
});

// Get list of all method names on orders
const SLOTS_METHODS = _.pluck([
  insertStaticSlot,
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
