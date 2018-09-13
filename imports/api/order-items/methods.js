import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { OrderItems } from './order-items.js';
import { findOrderSubItems } from '/imports/api/orders/orders.js';
// import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

// Methods

// Call from server only

// Call from client

export const insertOrderItem = new ValidatedMethod({
  name: 'OrderItems.insert',
  validate: new SimpleSchema({
    user_id: { type: String },
    slot_id: { type: String, optional: true },
    item_id: { type: String },
    order_id: { type: String },
    week_of: { type: Date },
    editor: { type: String },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id: userId,
    slot_id: slotId,
    item_id: itemId,
    order_id: orderId,
    week_of: weekOf,
    editor,
  }) {
    const orderItem = {
      created_at: new Date(),
      user_id: userId,
      slot_id: slotId,
      item_id: itemId,
      order_id: orderId,
      week_of: weekOf,
      editor,
    };

    const orderItemId = OrderItems.insert(orderItem);
    return OrderItems.findOne({ _id: orderItemId });
  },
});

export const insertOrderItems = new ValidatedMethod({
  name: 'OrderItems.insertMultiple',
  validate: new SimpleSchema({
    user_id: { type: String },
    itemSlots: { type: [Object], optional: true, blackbox: true },
    order: { type: Object, blackbox: true },
    week_of: { type: Date },
    editor: { type: String },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id: userId,
    itemSlots,
    order,
    week_of: weekOf,
    editor,
  }) {
    const items = findOrderSubItems(order);

    const orderItems = items.map(item => ({
      week_of: weekOf,
      user_id: userId,
      item_id: item._id,
      slot_id: itemSlots && itemSlots[item._id],
      order_id: order._id,
      editor,
    }));

    orderItems.map(slot => insertOrderItem.call(slot));
  },
});

// Get list of all method names on orders
const ORDERITEMS_METHODS = _.pluck([
  insertOrderItem,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(ORDERITEMS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 25, 1000);
}
