import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { moment } from 'meteor/momentjs:moment';

import { Items } from '/imports/api/items/items.js';
import { Slots } from '/imports/api/slots/slots.js';
import { Menus } from '/imports/api/menus/menus.js';
import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

import { generateSlots, chooseItemsUsingSlots } from '/imports/ui/lib/pack_picker/pack_planner.js';

import { insertSlot } from '/imports/api/slots/methods.js';
import { insertOrderItems } from '/imports/api/order-items/methods.js';

import { Orders, findOrderSubItems } from './orders.js';
import { OrderItems } from '/imports/api/order-items/order-items.js';

// Methods
import { getMenuDWs } from '/imports/api/menus/methods.js';

// Zip Codes
import { zipZones } from '../delivery/zipcodes.js';

// Call from server only

// Call from client
const notUnpaid = subscription => subscription.status !== 'unpaid';

export const insertOrder = new ValidatedMethod({
  name: 'Orders.insert',
  validate: new SimpleSchema({
    user_id: { type: String },
    menu_id: { type: String },
    week_of: { type: Date },
    style: { type: String },
    itemSlots: { type: [Object], optional: true, blackbox: true },
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
    user_id: userId,
    menu_id: menuId,
    week_of: weekOf,
    style,
    items,
    subscriptions,
    changes,
  }) {
    // Prep vars
    const discount = {
      subscriber_discounts: [],
      value: 0,
    };
    const user = Meteor.users.findOne({ _id: userId });

    // Calc subtotal
    const subtotal = items.reduce((agg, item) => agg + item.price_per_unit, 0);

    const notUnpaidSubscriptions = subscriptions ? subscriptions.filter(notUnpaid) : [];
    // Set Subscription Discounts
    // do we need notUnpaid?

    // Set Pending Subscription Discounts
    if (notUnpaidSubscriptions && notUnpaidSubscriptions.length > 0) {
      // for each subscription
      notUnpaidSubscriptions.forEach((subscription) => {
        const subItemId = subscription.item_id;
        const subItemName = subscription.item_name;
        const isPackSub = subItemName.split(' ')[1].split('-')[1] === 'Pack';
        let discountValue = 0;
        // find the subscription item in the items list

        if (isPackSub) {
          discountValue = items.reduce((aggDiscountVal, item) => {
            let additional = 0;
            if (item.category === 'Meal' || item.category === 'Pack') {
              additional = (subscription.percent_off / 100) * item.price_per_unit;
            }
            return aggDiscountVal + additional;
          }, 0);
        }

        const subscriberDiscount = {
          item_id: subItemId,
          percent_off: subscription.percent_off,
          value: discountValue,
        };

        // add discount property to item
        // subItem.discount.subscriber_discount = subs[i].discount;
        // add discount object to order.discount
        discount.subscriber_discounts.push(subscriberDiscount);
        discount.value += subscriberDiscount.value;
      });
    }

    // Set totals
    const salesTax = Math.round(subtotal * 0.08875 * 100) / 100;
    let total = Math.round((subtotal + salesTax - discount.value) * 100) / 100;

    let zip = user.address_zipcode;
    if (!zip) zip = user.profile.zipCode; // FIX! double check for users without address_zipcode
    const deliveryFees = zipZones[zip].delivery_fees;

    const deliveryFee = (subtotal > 150) ? deliveryFees.tier3 : deliveryFees.tier1;

    total += deliveryFee;

    // set discount value to 2 decimal
    discount.value = Math.round(discount.value * 100) / 100;

    const newOrder = {
      user_id: userId,
      menu_id: menuId,
      created_at: new Date(),
      week_of: weekOf,
      style,
      items,
      subscriptions: notUnpaidSubscriptions,
      subtotal,
      discount,
      sales_tax: salesTax,
      delivery_fee: deliveryFee,
      total,
      changes,
      status: 'pending',
    };

    const orderId = Orders.insert(newOrder);
    return Orders.findOne({ _id: orderId });
  },
});

export const updateOrder = new ValidatedMethod({
  name: 'updateOrder',
  validate: new SimpleSchema({
    _id: { type: String },
    created_at: { type: Date, optional: true },
    id_number: { type: Number, optional: true },
    status: { type: String, optional: true },
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
    itemSlots: { type: [Object], optional: true, blackbox: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    _id,
    created_at: createdAt,
    id_number: idNumber,
    status,
    user_id: userId,
    menu_id: menuId,
    week_of: weekOf,
    recipient,
    gift,
    items,
    subscriptions,
    subtotal,
    discount,
    delivery_fee: deliveryFee,
    sales_tax: salesTax,
    total,
    payment_id: paymentId,
    paid_at: paidAt,
    ready_by: readyBy,
    delivery_window_id: deliveryWindowId,
    delivery_comments: deliveryComments,
    tracking_code: trackingCode,
    courier,
    delivered_at: deliveredAt,
    notes,
    changes,
    auto_correct: autoCorrect,
    itemSlots,
  }) {
    const prevOrder = Orders.findOne({ _id });

    const mergeObject = (prevObj, newObj) => Object.entries(newObj)
      .reduce((memo, [newKey, newVal]) => ({ ...memo, [newKey]: newVal || memo[newKey] }), prevObj);

    const mergedOrder = mergeObject(
      prevOrder, {
        _id,
        created_at: createdAt,
        id_number: idNumber,
        status,
        user_id: userId,
        menu_id: menuId,
        week_of: weekOf,
        recipient,
        gift,
        items,
        subscriptions,
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        sales_tax: salesTax,
        total,
        payment_id: paymentId,
        paid_at: paidAt,
        ready_by: readyBy,
        delivery_window_id: deliveryWindowId,
        delivery_comments: deliveryComments,
        tracking_code: trackingCode,
        courier,
        delivered_at: deliveredAt,
        notes,
        changes,
        auto_correct: autoCorrect,
      },
    );

    Orders.update(_id, { $set: mergedOrder });
    const updatedOrder = Orders.findOne({ _id });

    const prevStatus = prevOrder.status;

    const created = status === 'created';
    const createdCustom = status === 'custom-sub';
    const pendingNotDowngrade = (status === 'pending-sub') && (prevStatus !== 'created' || prevStatus !== 'custom-sub');
    const badStatus = (status === 'skipped' || status === 'canceled');

    if (created || createdCustom || pendingNotDowngrade || badStatus) {
      OrderItems.remove({
        user_id: updatedOrder.user_id,
        week_of: updatedOrder.week_of,
        order_id: updatedOrder._id,
      });
    }

    if (created || createdCustom || pendingNotDowngrade) {
      insertOrderItems.call({
        user_id: updatedOrder.user_id,
        order: updatedOrder,
        itemSlots,
        week_of: updatedOrder.week_of,
        editor: itemSlots ? 'AUTO_GENERATED' : 'USER',
      });
    }
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
  }).validator({ clean: true, filter: false }),
  applyOptions: { noRetry: true },
  run({
    user_id: userId, menu_id: menuId, week_of: weekOf, items,
  }) {
    // Prep vars
    let order = Orders.findOne({
      user_id: userId,
      week_of: weekOf,
      status: { $in: ['pending-sub', 'custom-sub', 'created', 'skipped', 'canceled'] },
    });

    const user = Meteor.users.findOne({ _id: userId });

    if (!order) {
      order = insertOrder.call({
        user_id: userId,
        menu_id: menuId,
        week_of: weekOf,
        style: 'pack',
        items,
        subscriptions: user.subscriptions,
        changes: {},
      });
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
    const dws = getMenuDWs.call({ menu_id: menuId });
    let deliveryWindowId;

    switch (user.preferredDelivDay) {
      case 'monday':
        [, deliveryWindowId] = dws;
        break;
      case 'sunday':
        [deliveryWindowId] = dws;
        break;
      default:
        deliveryWindowId = undefined;
        break;
    }

    const readyBy = moment(weekOf).add(1, 'week').add(16, 'hours').toDate();

    const updateOrderObj = {
      _id: order._id,
      user_id: userId,
      menu_id: menuId,
      created_at: new Date(),
      week_of: weekOf,
      style: 'pack',
      items,
      subscriptions: user.subscriptions,
      recipient,
      changes: {},
      status: order.status === 'pending' ? 'pending-sub' : order.status,
      ready_by: readyBy,
      delivery_window_id: deliveryWindowId,
    };

    updateOrder.call(updateOrderObj);
    return Orders.findOne({ _id: order._id });
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
    _id,
    recipient,
    gift,
    items,
    subscriptions,
    subtotal,
    discount,
    delivery_fee: deliveryFee,
    sales_tax: salesTax,
    total,
    payment_id: paymentId,
    paid_at: paidAt,
    ready_by: readyBy,
    delivery_window_id: deliveryWindowId,
    delivery_comments: deliveryComments,
    tracking_code: trackingCode,
    notes,
    changes,
    auto_correct: autoCorrect,
  }) {
    // this should be randomized
    const idNumber = Orders.find({ status: { $ne: 'pending' } }).count();

    updateOrder.call({
      _id,
      id_number: idNumber,
      status: 'created',
      recipient,
      gift,
      items,
      subscriptions,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      sales_tax: salesTax,
      total,
      payment_id: paymentId,
      paid_at: paidAt,
      ready_by: readyBy,
      delivery_window_id: deliveryWindowId,
      delivery_comments: deliveryComments,
      tracking_code: trackingCode,
      notes,
      changes,
      auto_correct: autoCorrect,
    });

    return Orders.findOne({ _id });
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
    paid_at: { type: Date, optional: true },
    payment_id: { type: String, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    _id,
    created_at: createdAt,
    id_number: idNumber,
    status,
    user_id: userId,
    menu_id: menuId,
    week_of: weekOf,
    recipient,
    gift,
    items,
    subscriptions,
    subtotal,
    discount,
    sales_tax: salesTax,
    ready_by: readyBy,
    delivery_window_id: deliverWindowId,
    delivery_comments: deliveryComments,
    notes,
    changes,
    auto_correct: autoCorrect,
  }) {
    // Prep vars
    let newSubtotal = 0;

    // Calc subtotal, build items list
    for (let i = items.length - 1; i >= 0; i -= 1) {
      newSubtotal += items[i].price_per_unit;
    }

    // discount.value = Math.round(discount.value * 100) / 100;

    // Set totals
    const newSalesTax = Math.round(newSubtotal * 0.08875 * 100) / 100;
    let newTotal = Math.round((newSubtotal + salesTax - discount.value) * 100) / 100;
    const zip = recipient.address_zipcode;
    const deliveryFees = zipZones[zip].delivery_fees;

    const newDeliveryFee = (subtotal > 150) ? deliveryFees.tier3 : deliveryFees.tier1;

    newTotal += newDeliveryFee;

    updateOrder.call({
      _id,
      created_at: createdAt,
      id_number: idNumber,
      status,
      user_id: userId,
      menu_id: menuId,
      week_of: weekOf,
      recipient,
      gift,
      items,
      subscriptions,
      subtotal: newSubtotal,
      discount,
      delivery_fee: newDeliveryFee,
      sales_tax: newSalesTax,
      total: newTotal,
      ready_by: readyBy,
      delivery_window_id: deliverWindowId,
      delivery_comments: deliveryComments,
      notes,
      changes,
      auto_correct: autoCorrect,
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
  run({ user_id: userId, timestamp }) {
    const weekStart = moment(timestamp).startOf('week').toDate();

    const args = {
      user_id: userId,
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
  run({ user_id: userId, timestamp }) {
    const weekStart = moment(timestamp).startOf('week').toDate();

    const args = {
      user_id: userId,
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
  run({ order_id: orderId }) {
    const order = Orders.findOne({ _id: orderId });
    const sub = order.subscriptions && order.subscriptions.length > 0;

    if (order.status === 'skipped') {
      let newStatus = 'pending';
      if (sub) newStatus += '-sub';
      // DON'T DO THIS ANY MORE
      updateOrder.call({
        _id: order._id,
        status: newStatus,
      });
    } else {
      // DON'T DO THIS ANY MORE
      updateOrder.call({
        _id: order._id,
        status: 'skipped',
      });
    }
  },
});

const MAIN_METHODS = _.pluck([
  insertOrder,
  autoinsertSubscriberOrder,
  updateOrder,
  updatePendingSubOrder,
  findUserFutureOrders,
], 'name');

// Get list of all method names on orders
const ORDERS_METHODS = _.pluck([toggleSkip], 'name');

if (Meteor.isServer) {
  Meteor.methods({
    processOrder({
      _id,
      status,
      user_id: userId,
      recipient,
      gift,
      items,
      subscriptions,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      sales_tax: salesTax,
      total,
      payment_id: paymentId,
      paid_at: paidAt,
      ready_by: readyBy,
      delivery_window_id: deliveryWindowId,
      delivery_comments: deliveryComments,
      tracking_code: trackingCode,
      notes,
      changes,
      auto_correct: autoCorrect,
    }) {
      const idNumber = Orders.find({ status: { $ne: 'pending' } }).count();
      const user = Meteor.users.findOne({ _id: userId });

      // if pending subscriptions, attach to customer.subscriptions
      let updatedSubscriptions;
      if (subscriptions) {
        const currentSubscriptions = user.subscriptions || [];

        updatedSubscriptions = subscriptions.map((subscription) => {
          if (subscription.status !== 'pending') { return subscription; }

          const updatedSubscription = ({ ...subscription, status: 'active', subscribed_at: new Date() });

          currentSubscriptions.push(updatedSubscription);

          Meteor.users.update({ _id: userId }, { $set: { subscriptions: currentSubscriptions } });

          return updatedSubscription;
        });
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

      const order = Orders.findOne({ _id });

      updateOrder.call({
        ...order,
        _id,
        id_number: idNumber,
        status: newStatus,
        recipient,
        gift,
        items,
        subscriptions: updatedSubscriptions,
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        sales_tax: salesTax,
        total,
        payment_id: paymentId,
        paid_at: paidAt,
        ready_by: readyBy,
        delivery_window_id: deliveryWindowId,
        delivery_comments: deliveryComments,
        tracking_code: trackingCode,
        notes,
        changes,
        auto_correct: autoCorrect,
      });

      return Orders.findOne({ _id });
    },
    toggleDeliveryDay({ day }) {
      const user = Meteor.user();

      if (!user) { return; }

      const now = new Date();
      const futureDeliveryWindows = DeliveryWindows.find({
        delivery_start_time: {
          $gte: now,
        },
      }).fetch();
      const futureDeliveryWindowIds = futureDeliveryWindows.map(dw => dw._id);

      const futureUserOrders = Orders.find({
        delivery_window_id: {
          $in: futureDeliveryWindowIds,
        },
        user_id: user._id,
      }).fetch();

      futureUserOrders.map((order) => {
        const dwIds = getMenuDWs.call({ menu_id: order.menu_id });


        const dws = DeliveryWindows.find({
          _id: {
            $in: dwIds,
          },
        }).fetch();

        const newDeliveryWindow = dws.filter(dw => dw.delivery_day === day)[0];

        // DON'T DO THIS ANY MORE
        updateOrder.call({
          _id: order._id,
          delivery_window_id:
            newDeliveryWindow
              ? newDeliveryWindow._id
              : order.delivery_window_id,
        });

        return order;
      });
    },
    populateOrderItems({
      user_id: userId, menu_id: menuId, week_of: weekOf, items,
    }) {
      const user = Meteor.users.findOne({ _id: userId });
      const { restrictions: userDietRestrictions } = user;

      const getSubscriptionItem = sub => items.find(item => item._id === sub.item_id);

      const menu = Menus.findOne({ _id: menuId });
      const menuItems = Items.find({ _id: { $in: menu.items } }).fetch();

      user.subscriptions
        .filter(notUnpaid) // do we need this?
        .forEach((sub) => {
          const subscriptionItem = getSubscriptionItem(sub);

          if (!subscriptionItem) {
            // eslint-disable-next-line no-console
            console.log('non subscription item user = %j', user);
            return;
          }

          const { sub_items: { schema: packSchema } } = subscriptionItem;

          let userSlots = Slots.find({ user_id: user._id }).fetch();
          if (!userSlots.length) {
            const newSlots = generateSlots(packSchema, user._id, userDietRestrictions);
            userSlots = newSlots.map(slot => insertSlot.call(slot));
          }
          const itemChoices = chooseItemsUsingSlots(userSlots, menuItems);

          let order = Orders.findOne({
            week_of: weekOf, user_id: userId, style: 'pack',
          });

          const itemSlots = order && findOrderSubItems(order).length
            ? itemChoices.map(({ item }) => ({ item, slot: undefined }))
            : itemChoices;

          const itemAddedToOrder = order && findOrderSubItems(order).length
            ? findOrderSubItems(order)
            : itemSlots.map(({ item }) => item);

          const itemToSlot = itemSlots
            .reduce((memo, { slot, item }) => ({ ...memo, [item._id]: slot && slot._id }), {});

          if (!order) {
            order = insertOrder.call({
              user_id: user._id,
              menu_id: menuId,
              week_of: weekOf,
              style: 'pack',
              items: itemAddedToOrder,
              subscriptions: user.subscriptions,
              changes: {},
              itemToSlot,
            });
          }

          const pendingSubOrder = Orders.findOne({
            week_of: weekOf, user_id: userId, style: 'pack', status: 'pending-sub',
          });

          if (pendingSubOrder) {
            const pack = pendingSubOrder.items.find(item => item.category === 'Pack');

            const updatedPack = {
              ...pack,
              sub_items: {
                ...pack.sub_items,
                items: itemAddedToOrder,
              },
            };

            const updatedOrder = { ...pendingSubOrder, items: [updatedPack], itemSlots };

            updateOrder.call(updatedOrder);
          }
        });
    },
  });


  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(ORDERS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);

  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(MAIN_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 1000, 1000);
}
