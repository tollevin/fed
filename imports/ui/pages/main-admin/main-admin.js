import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import moment from 'moment';
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
  this.subscribe('allThisWeeks.orders', timestamp);
  this.subscribe('Future.orders', timestamp);
  this.subscribe('Menus.thisWeek', timestamp);
  this.subscribe('Menus.toCome');
  this.subscribe('subscriberData');

  this.itemInfo = new ReactiveVar();
  this.showTallies = new ReactiveVar(false);

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      const itemTallies = [];
      const menuThisWeek = Items.find({}, { fields: { name: 1, category: 1 } }).fetch();
      menuThisWeek.forEach((item) => {
        item.count = 0;
        itemTallies.push(item);
      });
      const lastSundayAtNoon = toNewYorkTimezone(moment()).day(0).hour(12)
        .minute(1)
        .second(0)
        .utc()
        .toDate();
      const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
        .toDate();
      const ordersThisWeek = Orders.find({ week_of: thisWeekStart, status: { $nin: ['skipped', 'pending-sub'] } }, { fields: { items: 1 } });

      const orderedItems = [];

      ordersThisWeek.forEach((order) => {
        order.items.forEach((item) => {
          if (item.category === 'Pack') {
            item.sub_items.items.forEach((sub_item) => {
              orderedItems.push(sub_item);
            });
          } else {
            orderedItems.push(item);
          }
        });
      });
      itemTallies.forEach((item) => {
        for (let i = orderedItems.length - 1; i >= 0; i--) {
          if (item._id === orderedItems[i]._id) {
            item.count += 1;
          }
        }
      });
      this.itemInfo.set(itemTallies);
    }
  });
});

Template.Main_admin.helpers({
  itemsThisWeek: () => Template.instance().itemInfo.get(),

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
  	for (let i = todaysOrders.length - 1; i >= 0; i--) {
  		totalSalesToday += (Number(todaysOrders[i].total));
  	}
  	return totalSalesToday.toFixed(2);
  },

  salesThisWeek: () => {
  	let totalSalesThisWeek = 0;
    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
  	const thisWeeksOrders = Orders.find({ week_of: thisWeekStart, status: { $nin: ['skipped', 'pending-sub'] } }).fetch();
  	for (let i = thisWeeksOrders.length - 1; i >= 0; i--) {
  		totalSalesThisWeek += (Number(thisWeeksOrders[i].total) * 1.08875);
  	}
  	return totalSalesThisWeek.toFixed(2);
  },

  totalSubs: () => Meteor.users.find({ 'subscriptions.status': { $ne: 'canceled' } }).count(),

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
    for (let i = pendingSubOrders.length - 1; i >= 0; i--) {
  		const plateCount = 0;
      pendingSubOrders[i].items.forEach((item) => {
        if (item.category === 'Pack') {
          estimatedPlates += item.sub_items.schema.total;
        } else if (item.category === 'Meal') {
          estimatedPlates += 1;
        }
      });
  	}
  	return estimatedPlates;
  },

  customPlates: () => {
    const items = Template.instance().itemInfo.get();
    let customDishCount = 0;
    for (let i = items.length - 1; i >= 0; i--) {
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
    for (var i = pendingSubOrders.length - 1; i >= 0; i--) {
      const plateCount = 0;
      pendingSubOrders[i].items.forEach((item) => {
        if (item.category === 'Pack') {
          estimatedPlates += item.sub_items.schema.total;
        } else if (item.category === 'Meal') {
          estimatedPlates += 1;
        }
      });
    }

    const items = Template.instance().itemInfo.get();
    let customDishCount = 0;
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].category === 'Meal') {
        customDishCount += items[i].count;
      }
    }

    const estimatedTotalPlates = customDishCount + estimatedPlates;
    return estimatedTotalPlates;
  },
});

Template.Main_admin.events({
  'click #checkUsers'(event) {
    event.preventDefault();

    // Get array of all subs
    const allSubs = Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }).fetch();

    // if sub status is canceled, -> cancelSubscription FIX DELETE
    for (var j = allSubs.length - 1; j >= 0; j--) {
      for (let k = allSubs[j].subscriptions.length - 1; k >= 0; k--) {
        if (allSubs[j].subscriptions[k].status === 'canceled') {
          Meteor.call('cancelSubscription', allSubs[j]._id, allSubs[j].subscriptions[k]._id, (error, response) => {
            if (error) {
              console.log(`${error}; error :${allSubs[j]._id}`);
            }
          });
        }
      }
    }

    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').utc()
      .toDate();
    const updatedSubUsers = Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }).fetch();
    console.log(updatedSubUsers.length);
    const thisWeeksOrders = Orders.find({ week_of: thisWeekStart, status: { $in: ['pending-sub', 'custom-sub', 'skipped', 'created'] } }).fetch();
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
    for (var i = updatedSubUsers.length - 1; i >= 0; i--) {
      const user_id = updatedSubUsers[i]._id;

      // find user's orders
      const ordersThisWeek = Orders.find({ user_id, week_of: thisWeekStart, status: { $in: ['pending-sub', 'custom-sub', 'created', 'skipped'] } }).fetch();

      // if no order, create a pending-sub order for them
      if (ordersThisWeek.length < 1) {
        let subItems;
        Meteor.call('getUserSubscriptionItems', user_id, (error, response) => {
          if (error) {
            console.log(`${error}; error :${user_id}`);
          } else {
            subItems = response;

            if (!menu) console.log('NO MENU!'); // FIX DELETE

            const data = {
              user_id,
              menu_id: menu._id,
              week_of: thisWeekStart,
              items: subItems,
            };

            const subOrder = autoinsertSubscriberOrder.call(data);
            console.log(`pending-sub order created for ${user_id}`);
          }
        });
      }

      // if more than one order this week, alert!
      if (ordersThisWeek.length > 1) {
        console.log(`Alert! ${user_id} has ${ordersThisWeek.length} orders for ${thisWeekStart}`);
      }
    }

    const skippers = [];

    // for each order
    for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
      subscribers[thisWeeksOrders[i].status] += 1;
      subscribers.all += 1;

      if (thisWeeksOrders[i].status === 'skipped') {
        skippers.push(thisWeeksOrders[i].recipient.email);
      }
    }

    console.log(skippers);
    console.log(subscribers);
  },

  'click #checkUsers2'(event) {
    event.preventDefault();

    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').add(1, 'w')
      .utc()
      .toDate();
    const updatedSubUsers = Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }).fetch();
    console.log(updatedSubUsers.length);
    const thisWeeksOrders = Orders.find({ week_of: thisWeekStart, status: { $in: ['pending-sub', 'custom-sub', 'skipped', 'created'] } }).fetch();
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

    const skippers = [];

    // for each user
    for (var i = updatedSubUsers.length - 1; i >= 0; i--) {
      const user_id = updatedSubUsers[i]._id;

      // find user's orders
      const ordersThisWeek = Orders.find({ user_id, week_of: thisWeekStart, status: { $in: ['pending-sub', 'custom-sub', 'created', 'skipped'] } }).fetch();

      // if no order, create a pending-sub order for them
      if (ordersThisWeek.length < 1) {
        let subItems;
        Meteor.call('getUserSubscriptionItems', user_id, (error, response) => {
          if (error) {
            console.log(`${error}; error :${user_id}`);
          } else {
            subItems = response;

            if (!menu) console.log('NO MENU!'); // FIX DELETE

            const data = {
              user_id,
              menu_id: menu._id,
              week_of: thisWeekStart,
              items: subItems,
            };

            const subOrder = autoinsertSubscriberOrder.call(data);
            console.log(`pending-sub order created for ${user_id}`);
          }
        });
      }

      // if more than one order this week, alert!
      if (ordersThisWeek.length > 1) {
        console.log(`Alert! ${user_id} has ${ordersThisWeek.length} orders for ${thisWeekStart}`);
      }
    }

    // for each order
    for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
      subscribers[thisWeeksOrders[i].status] += 1;
      subscribers.all += 1;

      if (thisWeeksOrders[i].status === 'skipped') {
        skippers.push(thisWeeksOrders[i].recipient.email);
      }
    }

    console.log(skippers);
    console.log(subscribers);
  },

  'click #checkUsers3'(event) {
    event.preventDefault();

    const thisWeekStart = toNewYorkTimezone(moment()).startOf('week').add(2, 'w')
      .utc()
      .toDate();
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
    for (var i = updatedSubUsers.length - 1; i >= 0; i--) {
      const user_id = updatedSubUsers[i]._id;

      // find user's orders
      const ordersThisWeek = Orders.find({ user_id, week_of: thisWeekStart, status: { $in: ['pending-sub', 'custom-sub', 'created', 'skipped'] } }).fetch();

      // if no order, create a pending-sub order for them
      if (ordersThisWeek.length < 1) {
        let subItems;
        Meteor.call('getUserSubscriptionItems', user_id, (error, response) => {
          if (error) {
            console.log(`${error}; error :${user_id}`);
          } else {
            subItems = response;

            if (!menu) console.log('NO MENU!'); // FIX DELETE

            const data = {
              user_id,
              menu_id: menu._id,
              week_of: thisWeekStart,
              items: subItems,
            };

            const subOrder = autoinsertSubscriberOrder.call(data);
            console.log(`pending-sub order created for ${user_id}`);
          }
        });
      }

      // if more than one order this week, alert!
      if (ordersThisWeek.length > 1) {
        console.log(`Alert! ${user_id} has ${ordersThisWeek.length} orders for ${thisWeekStart}`);
      }
    }

    const skippers = [];

    // for each order
    for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
      subscribers[thisWeeksOrders[i].status] += 1;
      subscribers.all += 1;

      if (thisWeeksOrders[i].status === 'skipped') {
        skippers.push(thisWeeksOrders[i].recipient.email);
      }
    }

    console.log(skippers);
    console.log(subscribers);
  },
});
