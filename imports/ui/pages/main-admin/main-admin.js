/* eslint no-console: [0] */

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { ReactiveVar } from 'meteor/reactive-var';
import { toNewYorkTimezone } from '/imports/ui/lib/time';

// Collections
import { Items } from '/imports/api/items/items.js';
import { Orders } from '/imports/api/orders/orders.js';
import { Menus } from '/imports/api/menus/menus.js';

// Components
import '/imports/ui/components/new-item/new-item.js';
import '/imports/ui/components/item-admin/item-admin.js';

// Methods
import { autoinsertSubscriberOrder } from '/imports/api/orders/methods.js';

// Template
import './main-admin.html';

Template.Main_admin.onCreated(function mainAdminOnCreated() {
  const timestamp = moment().toDate();
  this.subscribe('allThisWeeks.orders', { timestamp });
  this.subscribe('Future.orders', timestamp);
  this.subscribe('Menus.thisWeek', timestamp);
  this.subscribe('Menus.toCome');
  this.subscribe('subscriberData');

  this.customItemInfo = new ReactiveVar();
  this.autoItemInfo = new ReactiveVar();
  this.showTallies = new ReactiveVar(false);

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      // Build item list
      const menuThisWeek = Items.find({}, { fields: { name: 1, category: 1 } }).fetch();

      const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
        .toDate();

      // Create item tallies for custom orders, set to this.customItemInfo
      const customOrdersThisWeek = Orders.find({ week_of: thisWeekStart, status: { $nin: ['skipped', 'pending-sub'] } }, { fields: { items: 1 } });

      const customOrderedItems = [];

      customOrdersThisWeek.forEach((order) => {
        order.items.forEach((item) => {
          if (item.category === 'Pack') {
            item.sub_items.items.forEach((subItem) => {
              customOrderedItems.push(subItem);
            });
          } else {
            customOrderedItems.push(item);
          }
        });
      });
      const customItemTallies = menuThisWeek.map((item) => {
        let count = 0;
        for (let i = customOrderedItems.length - 1; i >= 0; i -= 1) {
          if (item._id === customOrderedItems[i]._id) {
            count += 1;
          }
        }
        return { ...item, count };
      });
      this.customItemInfo.set(customItemTallies);

      // Create item tallies for auto orders, set to this.autoItemInfo
      const autoOrdersThisWeek = Orders.find({ week_of: thisWeekStart, status: 'pending-sub' }, { fields: { items: 1 } });

      const autoOrderedItems = [];

      autoOrdersThisWeek.forEach((order) => {
        order.items.forEach((item) => {
          if (item.category === 'Pack') {
            item.sub_items.items.forEach((subItem) => {
              autoOrderedItems.push(subItem);
            });
          } else {
            autoOrderedItems.push(item);
          }
        });
      });
      const autoItemTallies = menuThisWeek.map((item) => {
        let count = 0;
        for (let i = autoOrderedItems.length - 1; i >= 0; i -= 1) {
          if (item._id === autoOrderedItems[i]._id) {
            count += 1;
          }
        }
        return { ...item, count };
      });
      this.autoItemInfo.set(autoItemTallies);
    }
  });
});

Template.Main_admin.helpers({
  customItemsThisWeek: () => Template.instance().customItemInfo.get(),

  autoItemsThisWeek: () => Template.instance().autoItemInfo.get(),

  beforeThurs: () => {
    const now = new moment();
    return (now.day() < 4);
  },

  ordersToday: () => {
    const todayStart = moment().startOf('day').toDate();
    return Orders.find({ paid_at: { $gte: todayStart } }).count();
  },

  ordersThisWeek: () => {
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    return Orders.find({ week_of: thisWeekStart, status: { $nin: ['skipped', 'pending-sub'] } }).count();
  },

  salesToday: () => {
    let totalSalesToday = 0;
    const todayStart = moment().startOf('day').toDate();
    const todaysOrders = Orders.find({ paid_at: { $gte: todayStart } }).fetch();
    for (let i = todaysOrders.length - 1; i >= 0; i -= 1) {
      totalSalesToday += (Number(todaysOrders[i].total));
    }
    return totalSalesToday.toFixed(2);
  },

  salesThisWeek: () => {
    let totalSalesThisWeek = 0;
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    const thisWeeksOrders = Orders.find({ week_of: thisWeekStart, status: { $nin: ['skipped', 'pending-sub'] } }).fetch();
    for (let i = thisWeeksOrders.length - 1; i >= 0; i -= 1) {
      totalSalesThisWeek += (Number(thisWeeksOrders[i].total));
    }
    return totalSalesThisWeek.toFixed(2);
  },

  totalSubs: () => Meteor.users.find({ subscriptions: { $exists: true }, 'subscriptions.status': { $ne: 'canceled' } }).count(),

  customizedSubs: () => {
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    return Orders.find({ week_of: thisWeekStart, status: 'custom-sub' }).count();
  },

  skippingSubs: () => {
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    const totalSkippedOrdersThisWeek = Orders.find({ week_of: thisWeekStart, status: 'skipped' }).count();
    return totalSkippedOrdersThisWeek;
  },

  newSubs: () => {
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    return Meteor.users.find({ 'subscriptions.created_at': { $gte: thisWeekStart } }).count();
  },

  canceledSubs: () => {
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    return Meteor.users.find({ 'subscriptions.canceled_at': { $gte: thisWeekStart } }).count();
  },

  estimatedSubPlates: () => {
    let estimatedPlates = 0;
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    // Get all pending-sub orders
    const pendingSubOrders = Orders.find({ week_of: thisWeekStart, status: 'pending-sub' }).fetch();
    // Add the default number of dishes for each to total
    pendingSubOrders.forEach((pendingSubOrder) => {
      pendingSubOrder.items.forEach((item) => {
        if (item.category === 'Pack') {
          estimatedPlates += item.sub_items.schema.total;
          return;
        }
        if (item.category === 'Meal') {
          estimatedPlates += 1;
        }
      });
    });
    return estimatedPlates;
  },

  customPlates: () => {
    const items = Template.instance().customItemInfo.get();
    let customDishCount = 0;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (items[i].category === 'Meal') {
        customDishCount += items[i].count;
      }
    }
    return customDishCount;
  },

  estimatedTotalPlates: () => {
    let estimatedPlates = 0;
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    // Get all pending-sub orders
    const pendingSubOrders = Orders.find({ week_of: thisWeekStart, status: 'pending-sub' }).fetch();
    // Add the default number of dishes for each to total
    pendingSubOrders.forEach((pendingSubOrder) => {
      pendingSubOrder.items.forEach((item) => {
        if (item.category === 'Pack') {
          estimatedPlates += item.sub_items.schema.total;
          return;
        }
        if (item.category === 'Meal') {
          estimatedPlates += 1;
        }
      });
    });

    const items = Template.instance().customItemInfo.get();
    let customDishCount = 0;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (items[i].category === 'Meal') {
        customDishCount += items[i].count;
      }
    }

    const estimatedTotalPlates = customDishCount + estimatedPlates;
    return estimatedTotalPlates;
  },
});


const checkUsers = (thisWeekStart) => {
  const updatedSubUsers = Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }).fetch();
  console.log(updatedSubUsers.length);

  const thisWeeksOrders = Orders.find({ week_of: thisWeekStart, status: { $in: ['pending-sub', 'custom-sub', 'created', 'skipped'] } }).fetch();
  console.log(thisWeeksOrders.length);

  const menu = Menus.findOne({ online_at: thisWeekStart });

  // create tally
  const subscribers = {
    'custom-sub': 0,
    'pending-sub': 0,
    skipped: 0,
    created: 0,
    all: 0,
  };

  // for each user
  updatedSubUsers.forEach((updatedSubUser) => {
    const userId = updatedSubUser._id;

    // find user's orders
    // if no order, create a pending-sub order for them

    const order = Orders.findOne({
      user_id: userId,
      week_of: thisWeekStart,
      status: { $in: ['pending-sub', 'custom-sub', 'created', 'skipped', 'canceled'] },
    });

    Meteor.call('getUserSubscriptionItems', userId, (error, items) => {
      if (error) { return; }

      autoinsertSubscriberOrder.call({
        user_id: userId,
        menu_id: menu._id,
        week_of: thisWeekStart,
        items: order ? order.items : items,
      });

      Meteor.call('populateOrderItems', {
        user_id: userId,
        menu_id: menu._id,
        week_of: thisWeekStart,
        items: order ? order.items : items,
      });
    });

    // if more than one order this week, alert!
    // if (ordersThisWeek.length > 1) {
    // console.log(`Alert! ${userId} has ${ordersThisWeek.length} orders for ${thisWeekStart}`);
    // }
  });

  // for each order
  thisWeeksOrders.forEach((thisWeekOrder) => {
    subscribers[thisWeekOrder.status] += 1;
    subscribers.all += 1;
  });

  const skippers = thisWeeksOrders
    .filter(({ status }) => status === 'skipped')
    .map(({ recipient: { email } }) => email);

  console.log(skippers);
  console.log(subscribers);
};

Template.Main_admin.events({
  'click #checkUsers'(event) {
    event.preventDefault();

    // Get array of all subs
    const users = Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }).fetch();

    // if sub status is canceled, -> cancelSubscription FIX DELETE
    users.forEach((user) => {
      user.subscriptions
        .filter(sub => sub.status === 'canceled')
        .forEach((sub) => {
          Meteor.call('cancelSubscription', user._id, sub._id, () => { });
        });
    });

    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc().toDate();
    checkUsers(thisWeekStart);
  },

  'click #checkUsers2'(event) {
    event.preventDefault();

    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').add(1, 'w').utc()
      .toDate();
    checkUsers(thisWeekStart);
  },

  'click #checkUsers3'(event) {
    event.preventDefault();

    console.log('checkusers 3 clicked');

    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').add(2, 'w').utc()
      .toDate();
    checkUsers(thisWeekStart);
  },
});
