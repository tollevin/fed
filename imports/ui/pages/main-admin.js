import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Items } from '../../api/items/items.js';
import { Orders } from '../../api/orders/orders.js';

import './main-admin.html';

// Components used inside the template
import '../components/new-item.js';
import '../components/item-admin.js';

Template.Main_admin.onCreated(function mainAdminOnCreated() {
	const handle = this.subscribe('items.thisWeek');
	this.subscribe('thisWeeks.orders');
	this.subscribe('subscriberData');

	this.itemInfo = new ReactiveVar ();
	this.showTallies = new ReactiveVar (false);

	this.autorun(() => {
		const isReady = handle.ready();
    if (isReady) {
			var itemTallies = [];
			const menuThisWeek = Items.find({"active": true}, { fields: { name: 1, course: 1 }}).fetch();
			menuThisWeek.forEach((item) => {
				item.count = 0
				itemTallies.push(item);
			});
			const lastSundayAtNoon = moment().day(0).hour(12).minute(1).second(0).toISOString();
			const ordersThisWeek = Orders.find({"createdAt": { $gte: new Date(lastSundayAtNoon) }}, { fields: { packDishes: 1, packSnacks: 1 }});
			
			var orderedItems = [];
			
			ordersThisWeek.forEach((order) => {
				order.packDishes.forEach((item) => {
					orderedItems.push(item);
				});
				order.packSnacks.forEach((item) => {
					orderedItems.push(item);
				});
			});
			itemTallies.forEach((item) => {
				for (var i = orderedItems.length - 1; i >= 0; i--) {
					if (item.name === orderedItems[i]) {
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
  	const todayStart = moment().hour(0).minute(0).second(0);
  	return Orders.find({"createdAt": { $gte: new Date(todayStart) }}).count();
  },

  ordersThisWeek: ()=> {
  	return Orders.find({}).count();
  },

  salesToday: ()=> {
  	var totalSalesToday = 0;
  	const todayStart = moment().hour(0).minute(0).second(0);
  	const todaysOrders = Orders.find({"createdAt": { $gte: new Date(todayStart) }}).fetch();
  	for (var i = todaysOrders.length - 1; i >= 0; i--) {
  		totalSalesToday += (Number(todaysOrders[i].salePrice) * 1.08875);
  	};
  	return totalSalesToday.toFixed(2);
  },

  salesThisWeek: ()=> {
  	var totalSalesThisWeek = 0;
  	const thisWeekStart = moment().day(0).hour(0).minute(0).second(0);
  	const thisWeeksOrders = Orders.find({}).fetch();
  	for (var i = thisWeeksOrders.length - 1; i >= 0; i--) {
  		totalSalesThisWeek += (Number(thisWeeksOrders[i].salePrice) * 1.08875);
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
  	return Meteor.users.find({customized: true}).count();
  },

  skippingSubs: ()=> {
  	return Meteor.users.find({skipping: {$nin : [null, false]}}).count();
  },

  newSubs: ()=> {
  	const thisWeekStartInUnixSeconds = moment().day(0).hour(0).minute(0).second(0).unix();
  	return Meteor.users.find({'subscriptions.created': {$gte : thisWeekStartInUnixSeconds}}).count();
  },

  canceledSubs: ()=> {
  	const thisWeekStartInUnixSeconds = moment().day(0).hour(0).minute(0).second(0).unix();
  	return Meteor.users.find({'subscriptions.canceled_at': {$gte : thisWeekStartInUnixSeconds}}).count();
  },

  estimatedSubPlates: ()=> {
  	var estimatedPlates = 0;
    // Get all uncanceled subs
  	const activeSubs = Meteor.users.find({'subscriptions.status': { $in: ['active','trialing']}}).fetch();
  	// Add the default number of dishes for each to total
    for (var i = activeSubs.length - 1; i >= 0; i--) {
  		var subPlateCount = Number(activeSubs[i].subscriptions.plan.id.split('PP')[0]);
  		estimatedPlates += subPlateCount;
  	};
  	const customizedSubs = Meteor.users.find({customized: true}).fetch();
  	for (var i = customizedSubs.length - 1; i >= 0; i--) {
  		var customizedSubPlateCount = Number(customizedSubs[i].subscriptions.plan.id.split('PP')[0]);
  		estimatedPlates -= customizedSubPlateCount;
  	};
    const skippingSubs = Meteor.users.find({skipping: { $ne : undefined }}).fetch();
    for (var i = skippingSubs.length - 1; i >= 0; i--) {
      var skippingSubPlateCount = Number(skippingSubs[i].subscriptions.plan.id.split('PP')[0]);
      estimatedPlates -= skippingSubPlateCount;
    };
  	return estimatedPlates;
  },

  customPlates: ()=> {
    var items = Template.instance().itemInfo.get();
    var customDishCount = 0; 
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].course === 'Dish') {
        customDishCount += items[i].count;
      }
    };
    return customDishCount;
  },

  estimatedTotalPlates: ()=> {
    var estimatedPlates = 0;
    // Get all uncanceled subs
    const activeSubs = Meteor.users.find({'subscriptions.status': { $in: ['active','trialing']}}).fetch();
    // Add the default number of dishes for each to total
    for (var i = activeSubs.length - 1; i >= 0; i--) {
      var subPlateCount = Number(activeSubs[i].subscriptions.plan.id.split('PP')[0]);
      estimatedPlates += subPlateCount;
    };
    const customizedSubs = Meteor.users.find({customized: true}).fetch();
    for (var i = customizedSubs.length - 1; i >= 0; i--) {
      var customizedSubPlateCount = Number(customizedSubs[i].subscriptions.plan.id.split('PP')[0]);
      estimatedPlates -= customizedSubPlateCount;
    };
    const skippingSubs = Meteor.users.find({skipping: { $ne : undefined }}).fetch();
    for (var i = skippingSubs.length - 1; i >= 0; i--) {
      var skippingSubPlateCount = Number(skippingSubs[i].subscriptions.plan.id.split('PP')[0]);
      estimatedPlates -= skippingSubPlateCount;
    };
    var items = Template.instance().itemInfo.get();
    var customDishCount = 0; 
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].course === 'Dish') {
        customDishCount += items[i].count;
      }
    };
    const estimatedTotalPlates = customDishCount + estimatedPlates;
    return estimatedTotalPlates;
  },
});


// Item tally code
