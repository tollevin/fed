import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment';
import 'moment-timezone';

// Template
import './main-admin.html';

// Collections
import { Items } from '../../api/items/items.js';
import { Orders } from '../../api/orders/orders.js';
import { Menus } from '../../api/menus/menus.js';

// Components
import '../components/new-item.js';
import '../components/item-admin.js';

// Methods
import { clearPSOrders } from '../../api/orders/methods.js';
import { autoinsertSubscriberOrder } from '../../api/orders/methods.js';

Template.Main_admin.onCreated(function mainAdminOnCreated() {
  const timestamp = moment().toDate();
  this.subscribe('allThisWeeks.orders', timestamp);
  this.subscribe('Future.orders', timestamp);
  this.subscribe('Menus.thisWeek', timestamp);
  this.subscribe('Menus.toCome');
  this.subscribe('subscriberData');

	this.itemInfo = new ReactiveVar ();
	this.showTallies = new ReactiveVar (false);

	this.autorun(() => {
		if (this.subscriptionsReady()) {
			var itemTallies = [];
			const menuThisWeek = Items.find({}, { fields: { name: 1, category: 1 }}).fetch();
			menuThisWeek.forEach((item) => {
				item.count = 0
				itemTallies.push(item);
			});
			const lastSundayAtNoon = moment().tz('America/New_York').day(0).hour(12).minute(1).second(0).utc().toDate();
      const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
      const ordersThisWeek = Orders.find({'week_of': thisWeekStart,'status': {$nin: ['skipped', 'pending-sub']}},{ fields: { items: 1 }});
			
			var orderedItems = [];
			
			ordersThisWeek.forEach((order) => {
				order.items.forEach((item) => {
          if (item.category === "Pack") {
            item.sub_items.items.forEach((sub_item) => {
              orderedItems.push(sub_item);
            });
          } else {
            orderedItems.push(item);
          };
				});
			});
			itemTallies.forEach((item) => {
				for (var i = orderedItems.length - 1; i >= 0; i--) {
					if (item._id === orderedItems[i]._id) {
						item.count += 1;
					};
				};
			});
			this.itemInfo.set(itemTallies);
		};
  });
});

Template.Main_admin.helpers({
  itemsThisWeek: ()=> {
  	return Template.instance().itemInfo.get();
  },

  beforeThurs: ()=> {
    var now = new moment();
    return (now.day() < 4);
  },

  ordersToday: ()=> {
  	const todayStart = moment().startOf('day').toDate();
  	return Orders.find({'paid_at': { $gte: todayStart }}).count();
  },

  ordersThisWeek: ()=> {
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
  	return Orders.find({ 'week_of': thisWeekStart, 'status': {$nin: ['skipped', 'pending-sub']}}).count();
  },

  salesToday: ()=> {
  	var totalSalesToday = 0;
  	const todayStart = moment().startOf('day').toDate();
  	const todaysOrders = Orders.find({"paid_at": { $gte: todayStart }}).fetch();
  	for (var i = todaysOrders.length - 1; i >= 0; i--) {
  		totalSalesToday += (Number(todaysOrders[i].total));
  	};
  	return totalSalesToday.toFixed(2);
  },

  salesThisWeek: ()=> {
  	var totalSalesThisWeek = 0;
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
  	const thisWeeksOrders = Orders.find({ 'week_of': thisWeekStart, 'status': {$nin: ['skipped', 'pending-sub']}}).fetch();
  	for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
  		totalSalesThisWeek += (Number(thisWeeksOrders[i].total) * 1.08875);
  	};
  	return totalSalesThisWeek.toFixed(2);
  },

  totalSubs: ()=> {
  	return Meteor.users.find({'subscriptions.status': {$ne : 'canceled'}}).count();
  },

  // activeSubs: ()=> {
  // 	return Meteor.users.find({'subscriptions.status': 'active'}).count();
  // },

  customizedSubs: ()=> {
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
  	return Orders.find({'week_of': thisWeekStart, 'status': 'custom-sub'}).count();
  },

  skippingSubs: ()=> {
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
    var totalSkippedOrdersThisWeek = Orders.find({'week_of': thisWeekStart, 'status': 'skipped'}).count();
   //  const thisWeekStart = moment().day(0).hour(0).minute(0).second(0);
   //  const thisWeeksOrders = Orders.find({}).fetch();
   //  for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
   //    totalSalesThisWeek += (Number(thisWeeksOrders[i].total) * 1.08875);
   //  };
   //  return totalSalesThisWeek.toFixed(2);
  	// return Meteor.users.find({skipping: {$nin : [null, false]}}).count();
    return totalSkippedOrdersThisWeek;
  },

  newSubs: ()=> {
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
  	return Meteor.users.find({'subscriptions.created_at': {$gte : thisWeekStart}}).count();
  },

  canceledSubs: ()=> {
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
  	return Meteor.users.find({'subscriptions.canceled_at': {$gte : thisWeekStart}}).count();
  },

  estimatedSubPlates: ()=> {
  	var estimatedPlates = 0;
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
    // Get all pending-sub orders
  	const pendingSubOrders = Orders.find({'week_of': thisWeekStart, 'status': 'pending-sub'}).fetch();
  	// Add the default number of dishes for each to total
    for (var i = pendingSubOrders.length - 1; i >= 0; i--) {
  		var plateCount = 0;
      pendingSubOrders[i].items.forEach((item)=> {
        if (item.category === "Pack") {
          estimatedPlates += item.sub_items.schema.total;
        } else if (item.category === "Meal") {
          estimatedPlates += 1;
        }
      });
  	};
  	return estimatedPlates;
  },

  customPlates: ()=> {
    var items = Template.instance().itemInfo.get();
    var customDishCount = 0; 
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].category === "Meal") {
        customDishCount += items[i].count;
      }
    };
    return customDishCount;
  },

  estimatedTotalPlates: ()=> {
    var estimatedPlates = 0;
    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
    // Get all pending-sub orders
    const pendingSubOrders = Orders.find({'week_of': thisWeekStart, 'status': 'pending-sub'}).fetch();
    // Add the default number of dishes for each to total
    for (var i = pendingSubOrders.length - 1; i >= 0; i--) {
      var plateCount = 0;
      pendingSubOrders[i].items.forEach((item)=> {
        if (item.category === "Pack") {
          estimatedPlates += item.sub_items.schema.total;
        } else if (item.category === "Meal") {
          estimatedPlates += 1;
        }
      });
    };

    var items = Template.instance().itemInfo.get();
    var customDishCount = 0; 
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].category === "Meal") {
        customDishCount += items[i].count;
      }
    };

    const estimatedTotalPlates = customDishCount + estimatedPlates;
    return estimatedTotalPlates;
  },
});

Template.Main_admin.events({
  'click #checkUsers'(event) {
    event.preventDefault();

    // Get array of all subs
    var allSubs = Meteor.users.find({"subscriptions.quantity": { $gt: 0 }}).fetch();

    // if sub status is canceled, -> cancelSubscription FIX DELETE
    for (var j = allSubs.length - 1; j >= 0; j--) {
      for (var k = allSubs[j].subscriptions.length - 1; k >= 0; k--) {
        if (allSubs[j].subscriptions[k].status === 'canceled') {
          Meteor.call('cancelSubscription', allSubs[j]._id, allSubs[j].subscriptions[k]._id, ( error, response ) => {
            if ( error ) {
              console.log(error + "; error :" + allSubs[j]._id);
            };
          });
        };
      };
    };

    const thisWeekStart = moment().tz('America/New_York').startOf('week').utc().toDate();
    var updatedSubUsers = Meteor.users.find({"subscriptions.quantity": { $gt: 0 }}).fetch();
    console.log( updatedSubUsers.length );
    var thisWeeksOrders = Orders.find({ 'week_of': thisWeekStart, status: {$in: ['pending-sub', 'custom-sub', 'skipped', 'created']}}).fetch();
    console.log(thisWeeksOrders.length);

    const menu = Menus.findOne({online_at: thisWeekStart});

    // create tally
    var subscribers = {
      'custom-sub': 0,
      'pending-sub': 0,
      'skipped':0,
      'created':0,
      'all':0
    };

    // for each user
    for (var i = updatedSubUsers.length - 1; i >= 0; i--) {
      const user_id = updatedSubUsers[i]._id;

      // find user's orders
      const ordersThisWeek = Orders.find({ 'user_id': user_id, 'week_of': thisWeekStart, 'status': {$in: ['pending-sub', 'custom-sub', 'created', 'skipped']} }).fetch();
     
      // if no order, create a pending-sub order for them
      if (ordersThisWeek.length < 1) {
        let subItems;
        Meteor.call('getUserSubscriptionItems', user_id, ( error, response ) => {
          if ( error ) {
            console.log(error + "; error :" + user_id);
          } else {
            subItems = response;

            if (!menu) console.log('NO MENU!'); // FIX DELETE

            const data = {
              user_id: user_id,
              menu_id: menu._id,
              week_of: thisWeekStart,
              items: subItems,
            };

            const subOrder = autoinsertSubscriberOrder.call(data);
            console.log('pending-sub order created for ' + user_id);
          };
        });
      };

      // if more than one order this week, alert!
      if (ordersThisWeek.length > 1) {
        console.log("Alert! " + user_id + ' has ' + ordersThisWeek.length + ' orders for ' + thisWeekStart);
      };
    };

    var skippers = [];

    // for each order
    for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
      subscribers[thisWeeksOrders[i].status] += 1;
      subscribers['all'] += 1;

      if (thisWeeksOrders[i].status === 'skipped') {
        skippers.push(thisWeeksOrders[i].recipient.email);
      };
    };

    console.log(skippers);
    console.log(subscribers);
  },

  'click #checkUsers2'(event) {
    event.preventDefault();

    const thisWeekStart = moment().tz('America/New_York').startOf('week').add(1, 'w').utc().toDate();
    var updatedSubUsers = Meteor.users.find({"subscriptions.quantity": { $gt: 0 }}).fetch();
    console.log( updatedSubUsers.length );
    var thisWeeksOrders = Orders.find({ 'week_of': thisWeekStart, 'status': {$in: ['pending-sub', 'custom-sub', 'skipped', 'created']}}).fetch();
    console.log(thisWeeksOrders.length);

    const menu = Menus.findOne({online_at: thisWeekStart});

    // create tally
    var subscribers = {
      'custom-sub': 0,
      'pending-sub': 0,
      'skipped':0,
      'created':0,
      'all':0
    };

    var skippers = [];

    // for each user
    for (var i = updatedSubUsers.length - 1; i >= 0; i--) {
      const user_id = updatedSubUsers[i]._id;

      // find user's orders
      const ordersThisWeek = Orders.find({ 'user_id': user_id, 'week_of': thisWeekStart, 'status': {$in: ['pending-sub', 'custom-sub', 'created', 'skipped']} }).fetch();
     
      // if no order, create a pending-sub order for them
      if (ordersThisWeek.length < 1) {
        let subItems;
        Meteor.call('getUserSubscriptionItems', user_id, ( error, response ) => {
          if ( error ) {
            console.log(error + "; error :" + user_id);
          } else {
            subItems = response;

            if (!menu) console.log('NO MENU!'); // FIX DELETE

            const data = {
              user_id: user_id,
              menu_id: menu._id,
              week_of: thisWeekStart,
              items: subItems,
            };

            const subOrder = autoinsertSubscriberOrder.call(data);
            console.log('pending-sub order created for ' + user_id);
          };
        });
      };

      // if more than one order this week, alert!
      if (ordersThisWeek.length > 1) {
        console.log("Alert! " + user_id + ' has ' + ordersThisWeek.length + ' orders for ' + thisWeekStart);
      };
    };

    // for each order
    for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
      subscribers[thisWeeksOrders[i].status] += 1;
      subscribers['all'] += 1;

      if (thisWeeksOrders[i].status === 'skipped') {
        skippers.push(thisWeeksOrders[i].recipient.email);
      };
    };

    console.log(skippers);
    console.log(subscribers);
  },

  'click #checkUsers3'(event) {
    event.preventDefault();

    const thisWeekStart = moment().tz('America/New_York').startOf('week').add(2,'w').utc().toDate();
    var updatedSubUsers = Meteor.users.find({"subscriptions.quantity": { $gt: 0 }}).fetch();
    console.log( updatedSubUsers.length );
    var thisWeeksOrders = Orders.find({ 'week_of': thisWeekStart, 'status': {$in: ['pending-sub', 'custom-sub', 'created', 'skipped']} }).fetch();
    console.log(thisWeeksOrders.length);

    const menu = Menus.findOne({online_at: thisWeekStart});

    // create tally
    var subscribers = {
      'custom-sub': 0,
      'pending-sub': 0,
      'skipped':0,
      'created':0,
      'all':0
    };

    // for each user
    for (var i = updatedSubUsers.length - 1; i >= 0; i--) {
      const user_id = updatedSubUsers[i]._id;

      // find user's orders
      const ordersThisWeek = Orders.find({ 'user_id': user_id, 'week_of': thisWeekStart, 'status': {$in: ['pending-sub', 'custom-sub', 'created', 'skipped']} }).fetch();
     
      // if no order, create a pending-sub order for them
      if (ordersThisWeek.length < 1) {
        let subItems;
        Meteor.call('getUserSubscriptionItems', user_id, ( error, response ) => {
          if ( error ) {
            console.log(error + "; error :" + user_id);
          } else {
            subItems = response;

            if (!menu) console.log('NO MENU!'); // FIX DELETE

            const data = {
              user_id: user_id,
              menu_id: menu._id,
              week_of: thisWeekStart,
              items: subItems,
            };

            const subOrder = autoinsertSubscriberOrder.call(data);
            console.log('pending-sub order created for ' + user_id);
          };
        });
      };

      // if more than one order this week, alert!
      if (ordersThisWeek.length > 1) {
        console.log("Alert! " + user_id + ' has ' + ordersThisWeek.length + ' orders for ' + thisWeekStart);
      };
    };

    var skippers = [];

    // for each order
    for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
      subscribers[thisWeeksOrders[i].status] += 1;
      subscribers['all'] += 1;

      if (thisWeeksOrders[i].status === 'skipped') {
        skippers.push(thisWeeksOrders[i].recipient.email);
      };
    };

    console.log(skippers);
    console.log(subscribers);
  },
});