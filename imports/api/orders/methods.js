import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Check } from 'meteor/check';

import { 
  Orders
} from './orders.js';

import { 
  Items
} from '../items/items.js';

import { 
  orderItem
} from '../items/methods.js';

var ordersLength = Orders.find({status: 'created'}).fetch.length;

export const insertOrder = new ValidatedMethod({
  name: 'InsertOrder',
  validate: new SimpleSchema({
    userId: { type: String, optional: true },
    packName: { type: String, optional: true },
    packPrice: { type: Number, optional: true },
    packDishes: { type: [ String ], optional: true },
    'packDishes.$': { type: String, optional: true },
    packSnacks: { type: [ String ], optional: true },
    'packSnacks.$': { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ userId, packName, packPrice, packDishes, packSnacks }) {

    const order = {
      userId,
      packName,
      packPrice,
      packDishes,
      packSnacks,
      createdAt: new Date(),
      status: 'pending'
    };
    
    const orderId = Orders.insert(order);
    const result = Orders.findOne({_id: orderId});
    return result;
  },
});

export const createSubscriptionOrder = new ValidatedMethod({
  name: 'createSubscriptionOrder',
  validate: new SimpleSchema({
    userId: { type: String },
    packName: { type: String, optional: true },
    packPrice: { type: Number, optional: true },
    salePrice: { type: String, optional: true },
    total: { type: String, optional: true },
    status: { type: String },
    coupon: { type: String, optional: true },
    destinationComments: { type: String, optional: true },
    deliv_day: { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ userId, packName, packPrice, salePrice, total, status, coupon, destinationComments, deliv_day }) {

    const id = Orders.find({status: 'created'}).count();

    const newOrder = { 
      id,
      userId,
      packName,
      packPrice,
      salePrice,
      total,
      status,
      coupon,
      destinationComments,
      deliv_day,
    };

    const orderId = Orders.insert(newOrder);
    const result = Orders.findOne({_id: orderId});
    return result;
  },
});

export const insertBlankOrder = new ValidatedMethod({
  name: 'insertBlankOrder',
  validate: new SimpleSchema({
    userId: { type: String },
    packName: { type: String, optional: true },
    packPrice: { type: Number, optional: true },
    salePrice: { type: String, optional: true },
    total: { type: String, optional: true },
    status: { type: String },
    coupon: { type: String, optional: true },
    destinationComments: { type: String, optional: true },
    deliv_day: { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ userId, packName, packPrice, salePrice, total, status, coupon, destinationComments, deliv_day }) {

    const id = Orders.find({status: 'created'}).count();

    const newOrder = { 
      id,
      userId,
      packName,
      packPrice,
      salePrice,
      total,
      status,
      coupon,
      destinationComments,
      deliv_day,
    };

    const orderId = Orders.insert(newOrder);
    const result = Orders.findOne({_id: orderId});
    return result;
  },
});

export const updateOrder = new ValidatedMethod({
  name: 'updateOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    userId: { type: String, optional: true },
    customer: { type: Object, blackbox: true, optional: true },
    packName: { type: String, optional: true },
    packPrice: { type: Number, optional: true },
    salePrice: { type: String, optional: true },
    total: { type: String, optional: true },
    packDishes: { type: [ String ] },
    'packDishes.$': { type: String },
    packSnacks: { type: [ String ] },
    'packSnacks.$': { type: String },
    status: { type: String },
    coupon: { type: String, optional: true },
    deliveryWindow: { type: String, optional: true },
    destinationComments: { type: String, optional: true },
    deliveredAt: { type: String, optional: true },
    trackingCode: { type: String, optional: true },
    createdAt: { type: Date, optional: true },
    paidAt: { type: Date, optional: true },
    readyBy: { type: String, optional: true },
    deliv_id: { type: String, optional: true },
    deliv_day: { type: String, optional: true },
    stripe_id: { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ _id, customer, packName, packPrice, salePrice, total, packDishes, packSnacks, status, coupon, deliveryWindow, destinationComments, deliveredAt, trackingCode, readyBy, deliv_id, deliv_day, stripe_id, paidAt }) {

    const id = Orders.find({status: 'created'}).count();

    Orders.update(_id, {
      $set: { 
        id: id,
        customer: customer,
        packName: packName,
        packPrice: packPrice,
        salePrice: salePrice,
        total: total,
        packDishes: packDishes,
        packSnacks: packSnacks,
        status: status,
        coupon: coupon,
        deliveryWindow: deliveryWindow,
        destinationComments: destinationComments,
        deliveredAt: deliveredAt,
        trackingCode: trackingCode,
        deliv_id: deliv_id,
        deliv_day: deliv_day,
        readyBy: readyBy,
        stripe_id: stripe_id,
        paidAt: paidAt,
      },
    });

    const result = Orders.findOne({_id: _id});
    return result;
  },
});

export const processOrder = new ValidatedMethod({
  name: 'processOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    userId: { type: String, optional: true },
    customer: { type: Object, optional: true },
    packName: { type: String, optional: true },
    packPrice: { type: Number, optional: true },
    salePrice: { type: String, optional: true },
    total: { type: String, optional: true },
    packDishes: { type: [ String ] },
    'packDishes.$': { type: String },
    packSnacks: { type: [ String ] },
    'packSnacks.$': { type: String },
    status: { type: String },
    coupon: { type: String, optional: true },
    deliveryWindow: { type: String, optional: true },
    destinationComments: { type: String, optional: true },
    deliveredAt: { type: String, optional: true },
    trackingCode: { type: String, optional: true },
    createdAt: { type: Date, optional: true },
    paidAt: { type: Date, optional: true },
    readyBy: { type: String, optional: true },
    deliv_id: { type: String, optional: true },
    deliv_day: { type: String, optional: true },
    stripe_id: { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ _id, packName, packPrice, salePrice, total, packDishes, packSnacks, status, coupon, deliveryWindow, destinationComments, deliveredAt, trackingCode, readyBy, deliv_id, deliv_day, stripe_id, paidAt }) {

    const id = Orders.find({status: 'created'}).count();
    const thisWeeksMenu = Items.find

    for (var i = packDishes.length - 1; i >= 0; i--) {
      orderItem.call(packDishes[i]);
    };

    for (var i = packSnacks.length - 1; i >= 0; i--) {
      orderItem.call(packSnacks[i]);
    };

    Orders.update(_id, {
      $set: { 
        id: id,
        packName: packName,
        packPrice: packPrice,
        salePrice: salePrice,
        total: total,
        packDishes: packDishes,
        packSnacks: packSnacks,
        status: status,
        coupon: coupon,
        deliveryWindow: deliveryWindow,
        destinationComments: destinationComments,
        deliveredAt: deliveredAt,
        trackingCode: trackingCode,
        deliv_id: deliv_id,
        deliv_day: deliv_day,
        readyBy: readyBy,
        stripe_id: stripe_id,
        paidAt: paidAt,
      },
    });

    const result = Orders.findOne({_id: _id});
    return result;
  },
});

// export const createRecurringOrder = new ValidatedMethod({
//   name: 'CreateRecurringOrder',
//   validate: new SimpleSchema({
//     userId: { type: String, optional: true },
//     packName: { type: String, optional: true },
//     packPrice: { type: Number, optional: true },
//     packDishes: { type: [ String ] },
//     'packDishes.$': { type: String },
//     packSnacks: { type: [ String ] },
//     'packSnacks.$': { type: String },
//   }).validator({ clean: true, filter: false }),
//   applyOptions: {
//     noRetry: true,
//   },
//   run({ userId, packName, packPrice, packDishes, packSnacks }) {

//     const order = {
//       userId,
//       packName,
//       packPrice,
//       packDishes,
//       packSnacks,
//       createdAt: new Date(),
//       status: 'pending'
//     };
    
//     const orderId = Orders.insert(order);
//     const result = Orders.findOne({_id: orderId});
//     return result;
//   },
// });

// Get list of all method names on orders
const Orders_METHODS = _.pluck([
  insertOrder,
  insertBlankOrder,
  updateOrder,
  processOrder,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(Orders_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
