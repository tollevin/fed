import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Check } from 'meteor/check';
import moment from 'moment';

import { Orders } from './orders.js';
import { Items } from '../items/items.js';
import { Menus } from '../menus/menus.js';
import { Plans } from '../plans/plans.js';

// Methods
import { orderItem } from '../items/methods.js';
import { getMenuDWs } from '../menus/methods.js';

// Zip Codes
import { zipZones } from '../delivery/zipcodes.js';

// Call from server only
const ordersLength = Orders.find({ status: { $nin: ['pending', 'pending-sub', 'skipped'] } }).fetch.length;

const updateOrderStatus = (order_id, status) => {
  Orders.update(order_id, {
    $set: {
      status,
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
    items: { type: [Object], optional: true },
    'items.$': { type: Object, blackbox: true, optional: true },
    subscriptions: { type: [Object], optional: true },
    'subscriptions.$': { type: Object, blackbox: true, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id, menu_id, week_of, style, items, subscriptions, changes,
  }) {
    // Prep vars
    let subtotal = 0;
    const discount = {
      subscriber_discounts: [],
      value: 0,
    };
    const user = Meteor.users.findOne({ _id: user_id });

    // Calc subtotal, build items list
    for (var i = items.length - 1; i >= 0; i--) {
      subtotal += items[i].price_per_unit;
    }

    // // Set Subscription Discounts
    // if (user.subscriptions && user.subscriptions.length > 0) {  // FIX to fix old user.subscriptions
    //   const subs = user.subscriptions;

    //   // for each subscription
    //   for (var i = subs.length - 1; i >= 0; i--) {
    //     const subItemId = subs[i].item_id;

    //     // find the subscription item in the items list
    //     var subItem = items.find((item)=> {
    //       return item._id === subItemId;
    //     });

    //     // Only add discount if subItem is in list? What about a general pack discount?
    //     if (subItem) {
    //       const subscriber_discount = {
    //         item_id: subItemId,
    //         percent_off: subs[i].percent_off,
    //         value: subs[i].percent_off / 100 * subItem.price_per_unit,
    //       };

    //       // add discount property to item
    //       // subItem.discount.subscriber_discount = subs[i].discount;
    //       // add discount object to order.discount
    //       discount.subscriber_discounts.push(subscriber_discount);
    //       discount.value += (subs[i].percent_off / 100 * subItem.price_per_unit);
    //     };
    //   };
    // };

    // Set Pending Subscription Discounts
    if (subscriptions && subscriptions.length > 0) {
      // for each subscription
      for (var i = subscriptions.length - 1; i >= 0; i--) {
        const subItemId = subscriptions[i].item_id;
        const subItemName = subscriptions[i].item_name;
        const isPackSub = subItemName.split(' ')[1].split('-')[1] === 'Pack';
        let discountValue = 0;
        // find the subscription item in the items list

        if (isPackSub) {
          for (let j = items.length - 1; j >= 0; j--) {
            if (items[j].category === 'Meal') {
              discountValue += (subscriptions[i].percent_off / 100) * items[i].price_per_unit;
            } else if (items[j].category === 'Pack') {
              discountValue += (subscriptions[i].percent_off / 100) * items[i].price_per_unit;
            }
          }
        }

        const subscriber_discount = {
          item_id: subItemId,
          percent_off: subscriptions[i].percent_off,
          value: discountValue,
        };

        // add discount property to item
        // subItem.discount.subscriber_discount = subs[i].discount;
        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriber_discount);
        discount.value += subscriber_discount.value;
      }
    }

    // Set totals
    const sales_tax = Math.round(subtotal * 0.08875 * 100) / 100;
    let total = Math.round((subtotal + sales_tax - discount.value) * 100) / 100;
    let delivery_fee;
    const zip = user.address_zipcode;
    const deliveryFees = zipZones[zip].delivery_fees;

    if (subtotal > 150) {
      delivery_fee = deliveryFees.tier3;
    } else {
      delivery_fee = deliveryFees.tier1;
    }

    total += delivery_fee;

    // set discount value to 2 decimal
    discount.value = Math.round(discount.value * 100) / 100;

    const newOrder = {
      user_id,
      menu_id,
      created_at: new Date(),
      week_of,
      style,
      items,
      subscriptions,
      subtotal,
      discount,
      sales_tax,
      delivery_fee,
      total,
      changes,
      status: 'pending',
    };

    const orderId = Orders.insert(newOrder);

    const result = Orders.findOne({ _id: orderId });
    return result;
  },
});

export const autoinsertSubscriberOrder = new ValidatedMethod({
  name: 'Orders.autoinsertSubOrder',
  validate: new SimpleSchema({
    user_id: { type: String },
    menu_id: { type: String, optional: true },
    week_of: { type: Date },
    items: { type: [Object], optional: true },
    'items.$': { type: Object, blackbox: true, optional: true },
    // subscriptions: { type: [ Object ], optional: true },
    // 'subscriptions.$': { type: Object, blackbox: true, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id, menu_id, week_of, items,
  }) {
    // Prep vars
    let subtotal = 0;
    const itemIds = [];
    const discount = {
      subscriber_discounts: [],
      value: 0,
    };
    const user = Meteor.users.findOne({ _id: user_id });
    const subs = user.subscriptions;

    // Set Subscription Discounts
    if (user.subscriptions && user.subscriptions.length > 0) {
      // for each subscription
      for (let i = subs.length - 1; i >= 0; i--) {
        const subItemId = subs[i].item_id;

        // find the subscription item in the items list
        const subItem = items.find(item => item._id === subItemId);

        // add price to subtotal
        subtotal += subItem.price_per_unit;

        const subscriber_discount = {
          item_id: subItemId,
          percent_off: subs[i].percent_off,
          value: subs[i].percent_off / 100 * subItem.price_per_unit,
        };

        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriber_discount);
        discount.value += (subs[i].percent_off / 100 * subItem.price_per_unit);
      }

      // Create default recipient obj
      const recipient = {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
        address_line_1: user.address_line_1,
        address_line_2: user.address_line_2,
        address_city: user.address_city,
        address_state: user.address_state,
        address_zipcode: user.address_zipcode,
      };

      // find preferred delivery_window (FIX)
      const dws = getMenuDWs.call({ menu_id });
      let delivery_window_id;

      switch (user.preferredDelivDay) {
        case 'monday':
          delivery_window_id = dws[1];
        case 'sunday':
          delivery_window_id = dws[0];
      }

      const sales_tax = Math.round(subtotal * 0.08875 * 100) / 100;
      let total = Math.round((subtotal + sales_tax - discount.value) * 100) / 100;
      let delivery_fee;
      const zip = user.address_zipcode;
      const deliveryFees = zipZones[zip].delivery_fees;

      if (subtotal > 150) {
        delivery_fee = deliveryFees.tier3;
      } else {
        delivery_fee = deliveryFees.tier1;
      }

      total += delivery_fee;
      const ready_by = moment(week_of).add(1, 'week').add(16, 'hours').toDate();

      const newOrder = {
        user_id,
        menu_id,
        created_at: new Date(),
        week_of,
        style: 'pack',
        items,
        subscriptions: subs,
        recipient,
        subtotal,
        discount,
        sales_tax,
        delivery_fee,
        total,
        changes: {},
        status: 'pending-sub',
        ready_by,
        delivery_window_id,
      };

      const orderId = Orders.insert(newOrder);
      const result = Orders.findOne({ _id: orderId });

      // REMOVE
      console.log(`autoinsertSubscriberOrder called for ${Meteor.userId()}`);

      return result;
    }
  },
});


export const processOrder = new ValidatedMethod({
  name: 'processOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date },
    week_of: { type: Date, optional: true },
    status: { type: String },
    user_id: { type: String },
    menu_id: { type: String, optional: true },
    style: { type: String },
    recipient: { type: Object, blackbox: true },
    gift: { type: Boolean, optional: true },
    items: { type: [Object] },
    'items.$': { type: Object, blackbox: true },
    subscriptions: { type: [Object], optional: true },
    'subscriptions.$': { type: Object, blackbox: true, optional: true },
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
  run({
    _id, status, user_id, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, notes, changes, auto_correct,
  }) {
    const id_number = Orders.find({ status: { $ne: 'pending' } }).count();
    const user = Meteor.users.findOne({ _id: user_id });

    // if pending subscriptions, attach to customer.subscriptions
    if (subscriptions) {
      for (let i = subscriptions.length - 1; i >= 0; i--) {
        if (subscriptions[i].status === 'pending') {
          subscriptions[i].status = 'active';
          subscriptions[i].subscribed_at = new Date();

          let currentSubscriptions = user.subscriptions;

          if (currentSubscriptions) {
            currentSubscriptions.push(subscriptions[i]);
          } else {
            currentSubscriptions = [subscriptions[i]];
          }

          Meteor.users.update({ _id: user_id }, {
            $set: {
              subscriptions: currentSubscriptions,
            },
          });
        }
      }
    }

    let newStatus;

    switch (status) {
      case 'pending':
        newStatus = 'created';
        break;
      case 'pending-sub':
        newStatus = 'custom-sub';
        break;
      default:
        newStatus = status;
    }

    Orders.update(_id, {
      $set: {
        id_number,
        status: newStatus,
        recipient,
        gift,
        items,
        subscriptions,
        subtotal,
        discount,
        delivery_fee,
        sales_tax,
        total,
        payment_id,
        paid_at,
        ready_by,
        delivery_window_id,
        delivery_comments,
        tracking_code,
        notes,
        changes,
        auto_correct,
      },
    });

    const result = Orders.findOne({ _id });
    return result;
  },
});

export const processSubscriberOrder = new ValidatedMethod({
  name: 'processSubscriberOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date },
    week_of: { type: Date, optional: true },
    status: { type: String },
    user_id: { type: String },
    menu_id: { type: String, optional: true },
    style: { type: String },
    recipient: { type: Object, blackbox: true },
    gift: { type: Boolean, optional: true },
    items: { type: [Object] },
    'items.$': { type: Object, blackbox: true },
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
  run({
    _id, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, notes, changes, auto_correct,
  }) {
    const id_number = Orders.find({ status: { $ne: 'pending' } }).count();

    Orders.update(_id, {
      $set: {
        id_number,
        status: 'created',
        recipient,
        gift,
        items,
        subscriptions,
        subtotal,
        discount,
        delivery_fee,
        sales_tax,
        total,
        payment_id,
        paid_at,
        ready_by,
        delivery_window_id,
        delivery_comments,
        tracking_code,
        notes,
        changes,
        auto_correct,
      },
    });

    const result = Orders.findOne({ _id });
    return result;
  },
});

export const updateOrderItems = new ValidatedMethod({
  name: 'updateOrderItems',
  validate: new SimpleSchema({
    _id: { type: String },
    items: { type: [Object] },
    'items.$': { type: Object, blackbox: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ _id, item }) {

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
    week_of: { type: Date, optional: true },
    recipient: { type: Object, blackbox: true, optional: true },
    gift: { type: Boolean, optional: true },
    items: { type: [Object], optional: true },
    'items.$': { type: Object, blackbox: true, optional: true },
    subscriptions: { type: [Object], optional: true },
    'subscriptions.$': { type: Object, blackbox: true, optional: true },
    subtotal: { type: Number, decimal: true, optional: true },
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
    courier: { type: String, optional: true },
    delivered_at: { type: Date, optional: true },
    notes: { type: String, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
    auto_correct: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    _id, created_at, id_number, status, user_id, menu_id, week_of, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, courier, delivered_at, notes, changes, auto_correct,
  }) {
    const id = Orders.find({ status: { $ne: 'pending' } }).count();

    Orders.update(_id, {
      $set: {
        _id,
        created_at,
        id_number,
        status,
        user_id,
        menu_id,
        week_of,
        recipient,
        gift,
        items,
        subscriptions,
        subtotal,
        discount,
        delivery_fee,
        sales_tax,
        total,
        payment_id,
        paid_at,
        ready_by,
        delivery_window_id,
        delivery_comments,
        tracking_code,
        courier,
        delivered_at,
        notes,
        changes,
        auto_correct,
      },
    });

    const result = Orders.findOne({ _id });
    return result;
  },
});

export const updatePendingSubOrder = new ValidatedMethod({
  name: 'updatePendingSubOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date, optional: true },
    id_number: { type: Number, optional: true },
    status: { type: String },
    style: { type: String, optional: true },
    user_id: { type: String, optional: true },
    menu_id: { type: String, optional: true },
    week_of: { type: Date, optional: true },
    recipient: { type: Object, blackbox: true, optional: true },
    gift: { type: Boolean, optional: true },
    items: { type: [Object], optional: true },
    'items.$': { type: Object, blackbox: true, optional: true },
    subscriptions: { type: [Object], optional: true },
    'subscriptions.$': { type: Object, blackbox: true, optional: true },
    subtotal: { type: Number, decimal: true, optional: true },
    discount: { type: Object, blackbox: true, optional: true },
    delivery_fee: { type: Number, optional: true },
    sales_tax: { type: Number, decimal: true, optional: true },
    total: { type: Number, decimal: true, optional: true },
    ready_by: { type: Date, optional: true },
    delivery_window_id: { type: String, optional: true },
    delivery_comments: { type: String, optional: true },
    notes: { type: String, optional: true },
    changes: { type: Object, blackbox: true, optional: true },
    auto_correct: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    _id, created_at, id_number, status, user_id, menu_id, week_of, recipient, gift, items, subscriptions, subtotal, discount, delivery_fee, sales_tax, total, payment_id, paid_at, ready_by, delivery_window_id, delivery_comments, tracking_code, courier, delivered_at, notes, changes, auto_correct,
  }) {
    // Prep vars
    let newSubtotal = 0;
    const user = Meteor.users.findOne({ _id: user_id });

    // Calc subtotal, build items list
    for (let i = items.length - 1; i >= 0; i--) {
      newSubtotal += items[i].price_per_unit;
    }

    // discount.value = Math.round(discount.value * 100) / 100;

    // Set totals
    const newSalesTax = Math.round(newSubtotal * 0.08875 * 100) / 100;
    let newTotal = Math.round((newSubtotal + sales_tax - discount.value) * 100) / 100;
    let newDeliveryFee;
    const zip = recipient.address_zipcode;
    const deliveryFees = zipZones[zip].delivery_fees;

    if (subtotal > 150) {
      newDeliveryFee = deliveryFees.tier3;
    } else {
      newDeliveryFee = deliveryFees.tier1;
    }

    newTotal += newDeliveryFee;

    Orders.update(_id, {
      $set: {
        _id,
        created_at,
        id_number,
        status,
        user_id,
        menu_id,
        week_of,
        recipient,
        gift,
        items,
        subscriptions,
        subtotal: newSubtotal,
        discount,
        delivery_fee: newDeliveryFee,
        sales_tax: newSalesTax,
        total: newTotal,
        ready_by,
        delivery_window_id,
        delivery_comments,
        notes,
        changes,
        auto_correct,
      },
    });

    const result = Orders.findOne({ _id });
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
      user_id,
      ready_by: { $gte: weekStart },
    };

    const result = Orders.find(args);
    return result;
  },
});

export const findUserCurrentOrder = new ValidatedMethod({
  name: 'Orders.methods.findUserCurrentOrder',
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
      user_id,
      ready_by: { $gte: weekStart },
    };

    const result = Orders.find(args, { sort: { ready_by: 1 } }).fetch()[0];
    return result;
  },
});

export const toggleSkip = new ValidatedMethod({
  name: 'Orders.methods.toggleSkip',
  validate: new SimpleSchema({
    order_id: { type: String },
  }).validator({}),
  applyOptions: {
    noRetry: true,
  },
  run({ order_id }) {
    const order = Orders.findOne({ _id: order_id });
    const sub = order.subscriptions && order.subscriptions.length > 0;

    if (order.status === 'skipped') {
      var newStatus = 'pending';
      if (sub) newStatus += '-sub';
      Orders.update(order._id, {
        $set: {
          status: newStatus,
        },
      });
    } else {
      var newStatus = 'skipped';
      Orders.update(order._id, {
        $set: {
          status: newStatus,
        },
      });
    }
  },
});

export const clearPSOrders = new ValidatedMethod({
  name: 'Orders.methods.clearPSOrders',
  validate: null,
  applyOptions: {
    noRetry: true,
  },
  run() {
    const PSOrders = Orders.remove({ status: 'pending-sub' });
    return PSOrders;
  },
});

export const createPSOrders = new ValidatedMethod({
  name: 'Orders.methods.createPSOrders',
  validate: null,
  applyOptions: {
    noRetry: true,
  },
  run() {

  },
});

// Get list of all method names on orders
const Orders_METHODS = _.pluck([
  insertOrder,
  autoinsertSubscriberOrder,
  processOrder,
  updateOrder,
  updatePendingSubOrder,
  clearPSOrders,
  // cancelOrder,
  // updateOrderItems,
  findUserFutureOrders,
  toggleSkip,
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
