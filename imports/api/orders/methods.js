import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Check } from 'meteor/check';
import moment from 'moment';

import { Orders } from './orders.js';
import { Items } from '../items/items.js';
import { Plans } from '../plans/plans.js';

import { 
  orderItem
} from '../items/methods.js';

// Call from server only
var ordersLength = Orders.find({status: { $nin: ['pending', 'pending-sub', 'skipped' ] }}).fetch.length;

const updateOrderStatus = (order_id, status)=> {
  Orders.update(order_id, {
    $set: {
      status: status,
    },
  });
};

// Call from client

export const insertOrder = new ValidatedMethod({
  name: 'Orders.insert',
  validate: new SimpleSchema({
    user_id: { type: String },
    menu_id: { type: String },
    week_of: { type: Date },
    style: { type: String },
    items: { type: [ Object ], optional: true },
    'items.$': { type: Object, blackbox: true, optional: true },
    subscriptions: { type: [ Object ], optional: true },
    'subscriptions.$': { type: Object, blackbox: true, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ user_id, menu_id, week_of, style, items, subscriptions, changes }) {

    // Prep vars
    var subtotal = 0;
    var itemIds = [];
    var discount = {
      subscriber_discounts: [],
      value : 0
    };
    var user = Meteor.users.findOne({_id: user_id});

    // Calc subtotal, build items list
    for (var i = items.length - 1; i >= 0; i--) {
      itemIds.push(items[i]._id);
      subtotal += items[i].price_per_unit;
    };   

    // Set Subscription Discounts
    if (user.subscriptions && user.subscriptions.length > 0) {  // FIX to fix old user.subscriptions
      const subs = user.subscriptions;

      // for each subscription
      for (var i = subs.length - 1; i >= 0; i--) {
        const subItemId = subs[i].item_id;
      
        // find the subscription item in the items list
        var subItem = items.find((item)=> {
          return item._id === subItemId;
        });
        
        const subscriber_discount = {
          item_id: subItemId,
          percent_off: subs[i].percent_off,
          value: subs[i].percent_off / 100 * subItem.price_per_unit,
        };

        // add discount property to item
        // subItem.discount.subscriber_discount = subs[i].discount;
        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriber_discount);
        discount.value += (subs[i].percent_off / 100 * subItem.price_per_unit);
      };
    };

    // Set Pending Subscription Discounts
    if (subscriptions && subscriptions.length > 0) {

      // for each subscription
      for (var i = subscriptions.length - 1; i >= 0; i--) {
        const subItemId = subscriptions[i].item_id;
        // find the subscription item in the items list
        var subItem = items.find((item)=> {
          return item._id === subItemId;
        });

        const subscriber_discount = {
          item_id: subItemId,
          percent_off: subscriptions[i].percent_off,
          value: subscriptions[i].percent_off / 100 * subItem.price_per_unit,
        };

        // add discount property to item
        // subItem.discount.subscriber_discount = subs[i].discount;
        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriber_discount);
        discount.value += (subscriptions[i].percent_off / 100 * subItem.price_per_unit);
      };
    };

    var sales_tax = Math.round(subtotal * .08875 * 100) / 100;
    var total = Math.round((subtotal + sales_tax - discount.value) * 100) / 100;
    discount.value = Math.round(discount.value * 100) / 100;

    const newOrder = { 
      user_id,
      menu_id,
      created_at: new Date(),
      week_of,
      style,
      items: itemIds,
      subscriptions,
      subtotal,
      discount,
      sales_tax,
      total,
      changes,
      status: 'pending',
    };

    const orderId = Orders.insert(newOrder);
    const result = Orders.findOne({_id: orderId});
    return result;
  },
});

export const insertBlankSubscriberOrder = new ValidatedMethod({
  name: 'Orders.insertBlank',
  validate: new SimpleSchema({
    user_id: { type: String },
    menu_id: { type: String },
    week_of: { type: Date },
    style: { type: String },
    items: { type: [ Object ], optional: true },
    'items.$': { type: Object, blackbox: true, optional: true },
    subscriptions: { type: [ Object ], optional: true },
    'subscriptions.$': { type: Object, blackbox: true, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ user_id, menu_id, week_of, style, items, subscriptions, changes }) {

    // Prep vars
    var subtotal = 0;
    var itemIds = [];
    var subIds = [];
    var discount = {
      subscriber_discounts: [],
      value : 0
    };
    var user = Meteor.users.findOne({_id: user_id});

    // Set Subscription Discounts
    if (user.subscriptions && user.subscriptions.length > 0) {  // FIX to fix old user.subscriptions
      const subs = user.subscriptions;

      // for each subscription
      for (var i = subs.length - 1; i >= 0; i--) {
        subIds.push(subs[i]._id);
        const subItemId = subs[i].item_id;
      
        // find the subscription item in the items list
        var subItem = items.find((item)=> {
          return item._id === subItemId;
        });
        
        const subscriber_discount = {
          item_id: subItemId,
          percent_off: subs[i].percent_off,
          value: subs[i].percent_off / 100 * subItem.price_per_unit,
        };

        // add discount property to item
        // subItem.discount.subscriber_discount = subs[i].discount;
        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriber_discount);
        discount.value += (subs[i].percent_off / 100 * subItem.price_per_unit);
      };
    };

    // Set Pending Subscription Discounts
    if (subscriptions && subscriptions.length > 0) {

      // for each subscription
      for (var i = subscriptions.length - 1; i >= 0; i--) {

        const subItemId = subscriptions[i].item_id;
        // find the subscription item in the items list
        var subItem = items.find((item)=> {
          return item._id === subItemId;
        });
        console.log(subItem);

        const subscriber_discount = {
          item_id: subItemId,
          percent_off: subscriptions[i].percent_off,
          value: subscriptions[i].percent_off / 100 * subItem.price_per_unit,
        };

        // add discount property to item
        // subItem.discount.subscriber_discount = subs[i].discount;
        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriber_discount);
        discount.value += (subscriptions[i].percent_off / 100 * subItem.price_per_unit);
        console.log(subscriptions[i].percent_off);
      };
    };

    var sales_tax = Math.round(subtotal * .08875 * 100) / 100;
    var total = Math.round((subtotal + sales_tax - discount.value) * 100) / 100;

    const newOrder = { 
      user_id,
      menu_id,
      created_at: new Date(),
      week_of,
      style,
      items: itemIds,
      subscriptions: subIds,
      subtotal,
      discount,
      sales_tax,
      total,
      changes,
      status: 'pending',
    };

    const orderId = Orders.insert(newOrder);
    const result = Orders.findOne({_id: orderId});
    return result;
  },
});


export const processOrder = new ValidatedMethod({
  name: 'processOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date },
    week_of: {type: Date, optional: true },
    status: { type: String },
    user_id: { type: String },
    menu_id: { type: String, optional: true },
    style: { type: String },
    recipient: { type: Object, blackbox: true },
    gift: { type: Boolean, optional: true },
    items: { type: [ String ] },
    'items.$': { type: String },
    subscriptions: { type: [ Object ], optional: true },
    'subscriptions.$': { type: Object , blackbox: true, optional: true },
    subtotal: { type: Number, decimal: true },
    discount: { type: Object, blackbox: true, optional: true },
    delivery_fee: { type: Number, decimal: true, optional: true },
    sales_tax: { type: Number, decimal: true, optional: true },
    total: { type: Number, decimal: true, optional: true },
    payment_id: { type: String, optional: true },
    paid_at: { type: Date, optional: true },
    ready_by: { type: Date, optional: true },
    delivery_window_id: { type: String, optional: true },
    delivery_comments: { type: String, optional: true },
    tracking_code: { type: String, optional: true },
    // courier: { type: String, optional: true },
    // delivered_at: { type: Date, optional: true },
    notes: { type: String, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
    auto_correct: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ _id, user_id, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, notes, changes, auto_correct }) {

    const id_number = Orders.find({status: {$ne: 'pending'}}).count();
    const user = Meteor.users.findOne({_id: user_id});

    // if pending subscriptions, attach to customer.subscriptions
    for (var i = subscriptions.length - 1; i >= 0; i--) {
      if (subscriptions[i].status === 'pending') {
        subscriptions[i].status = 'active';
        subscriptions[i].subscribed_at = new Date();

        var currentSubscriptions = user.subscriptions;

        if (currentSubscriptions) {
          currentSubscriptions.push(subscriptions[i]);
        } else {
          currentSubscriptions = [subscriptions[i]];
        };

        Meteor.users.update({ _id: user_id }, {
          $set: {
            subscriptions: currentSubscriptions,
          }
        });
      };
    };

    Orders.update(_id, {
      $set: { 
        id_number: id_number,
        status: 'created',
        recipient: recipient,
        gift: gift,
        items: items,
        subscriptions: subscriptions,
        subtotal: subtotal,
        discount: discount,
        delivery_fee: delivery_fee,
        sales_tax: sales_tax,
        total: total,
        payment_id: payment_id,
        paid_at: paid_at,
        ready_by: ready_by,
        delivery_window_id: delivery_window_id,
        delivery_comments: delivery_comments,
        tracking_code: tracking_code,
        notes: notes,
        changes: changes,
        auto_correct: auto_correct,
      },
    });

    const result = Orders.findOne({_id: _id});
    return result;
  },
});

export const processSubscriberOrder = new ValidatedMethod({
  name: 'processSubscriberOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date},
    week_of: {type: Date, optional: true },
    status: { type: String },
    user_id: { type: String },
    menu_id: { type: String, optional: true },
    style: { type: String },
    recipient: { type: Object, blackbox: true },
    gift: { type: Boolean, optional: true },
    items: { type: [ String ] },
    'items.$': { type: String },
    subtotal: { type: Number, decimal: true },
    discount: { type: Object, blackbox: true, optional: true },
    delivery_fee: { type: Number, optional: true },
    sales_tax: { type: Number, decimal: true, optional: true },
    total: { type: Number, decimal: true, optional: true },
    payment_id: { type: String, optional: true },
    paid_at: { type: Date, optional: true },
    ready_by: { type: Date, optional: true },
    delivery_window_id: { type: String, optional: true },
    delivery_comments: { type: String, optional: true },
    tracking_code: { type: String, optional: true },
    // courier: { type: String, optional: true },
    // delivered_at: { type: Date, optional: true },
    notes: { type: String, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
    auto_correct: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ _id, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, notes, changes, auto_correct }) {

    const id_number = Orders.find({status: {$ne: 'pending'}}).count();

    Orders.update(_id, {
      $set: { 
        id_number: id_number,
        status: 'created',
        recipient: recipient,
        gift: gift,
        items: items,
        subscriptions: subscriptions,
        subtotal: subtotal,
        discount: discount,
        delivery_fee: delivery_fee,
        sales_tax: sales_tax,
        total: total,
        payment_id: payment_id,
        paid_at: paid_at,
        ready_by: ready_by,
        delivery_window_id: delivery_window_id,
        delivery_comments: delivery_comments,
        tracking_code: tracking_code,
        notes: notes,
        changes: changes,
        auto_correct: auto_correct,
      },
    });

    const result = Orders.findOne({_id: _id});
    return result;
  },
});

export const updateOrder = new ValidatedMethod({
  name: 'updateOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date, optional: true },
    id_number: { type: Number, optional: true },
    status: { type: String },
    style: { type: String, optional: true },
    user_id: { type: String, optional: true },
    menu_id: { type: String, optional: true },
    recipient: { type: Object, blackbox: true, optional: true },
    gift: { type: Boolean, optional: true },
    items: { type: [ String ] },
    'items.$': { type: String },
    subscriptions: { type: [ String ], optional: true },
    'subscriptions.$': { type: String, optional: true },
    subtotal: { type: Number, optional: true },
    discount: { type: Object, blackbox: true, optional: true },
    delivery_fee: { type: Number, optional: true },
    sales_tax: { type: Number, decimal: true, optional: true },
    total: { type: Number, optional: true },
    payment_id: { type: String, optional: true },
    paid_at: { type: Date, optional: true },
    ready_by: { type: Date, optional: true },
    delivery_window_id: { type: String, optional: true },
    delivery_comments: { type: String, optional: true },
    tracking_code: { type: String, optional: true },
    courier: { type: String, optional: true },
    delivered_at: { type: Date, optional: true },
    notes: { type: String, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
    auto_correct: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ _id, created_at, id_number, status, user_id, menu_id, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, courier, delivered_at, notes, changes, auto_correct }) {

    const id = Orders.find({status: { $ne: 'pending'}}).count();

    Orders.update(_id, {
      $set: { 
        _id: _id,
        started_at: started_at,
        created_at: created_at,
        id_number: id_number,
        status: status,
        user_id: user_id,
        menu_id: menu_id,
        recipient: recipient,
        gift: gift,
        items: items,
        subtotal: subtotal,
        discount: discount,
        delivery_fee: delivery_fee,
        sales_tax: sales_tax,
        total: total,
        payment_id: payment_id,
        paid_at: paid_at,
        ready_by: ready_by,
        delivery_window_id: delivery_window_id,
        delivery_comments: delivery_comments,
        tracking_code: tracking_code,
        courier: courier,
        delivered_at: delivered_at,
        notes: notes,
        changes: changes,
        auto_correct: auto_correct,
      },
    });

    const result = Orders.findOne({_id: _id});
    return result;
  },
});

export const findUserFutureOrders = new ValidatedMethod({
  name: 'Orders.methods.findUserFutureOrders',
  validate: new SimpleSchema({
    user_id: { type: String },
    timestamp: { type: Date },
  }).validator({}),
  applyOptions: {
    noRetry: true,
  },
  run({ user_id, timestamp }) {

    const weekStart = moment(timestamp).startOf('week').toDate();

    const args = {
      user_id: id,
      ready_by: { $gte: weekStart },
    };
    
    const result = Orders.find(args);
    return result;
  },
});

// export const insertCustomOrder = new ValidatedMethod({
//   name: 'Orders.methods.insertCustomOrder',
//   validate: new SimpleSchema({
//     user_id: { type: String, optional: true },
//     style: { type: String, optional: true },
//     week_of: { type: Date, optional: true }, // FIX BIX
//     items: { type: [ String ], optional: true },
//   }).validator({ clean: true, filter: false }),
//   applyOptions: {
//     noRetry: true,
//   },
//   run({ user_id, style, week_of, items }) {

//     const order = {
//       user_id: user_id || Meteor.userId(),
//       created_at: new Date(),
//       week_of,
//       items,
//       status: 'pending',
//       style,
//     };
    
//     const order_id = Orders.insert(order);
//     // const result = Orders.findOne({_id: order_id});
//     return order_id;
//   },
// });

// export const insertSubscriberOrder = new ValidatedMethod({
//   name: 'createSubscriptionOrder',
//   validate: new SimpleSchema({
//     user_id: { type: String },
//     created_at: { type: Date },
//     week_of: { type: Date },
//     items: { type: [ String ] },
//     'items.$': { type: String },
//     subtotal: { type: Number, optional: true },
//     discount: { type: Object, optional: true },
//     total: { type: Number, optional: true },
//     coupon: { type: String, optional: true },
//     delivery_comments: { type: String, optional: true },
//     deliv_day: { type: String, optional: true },
//   }).validator({ clean: true, filter: false }),
//   applyOptions: {
//     noRetry: true,
//   },
//   run({ user_id, week_of, items, packName, packPrice, salePrice, total, status, coupon, destinationComments, deliv_day }) {

//     const id_number = Orders.find({status: { $ne: 'pending'}}).count();

//     const newOrder = { 
//       id_number,
//       user_id,
//       packName,
//       packPrice,
//       salePrice,
//       total,
//       status: 'pending-sub',
//       coupon,
//       destinationComments,
//       deliv_day,
//     };

//     const orderId = Orders.insert(newOrder);
//     const result = Orders.findOne({_id: orderId});
//     return result;
//   },
// });

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
  processOrder,
  // cancelOrder,
  // updateOrderItems,
  findUserFutureOrders,
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
