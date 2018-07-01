import { Orders } from '/imports/api/orders/orders.js';
import { Items } from '/imports/api/items/items.js';

import './orders-sidebar.html';

Template.Orders_sidebar.onCreated(function ordersSidebarOnCreated() {
	const handle = this.subscribe('items.thisWeek');

	this.itemInfo = new ReactiveVar ();
	this.showTallies = new ReactiveVar (false);

	this.autorun(() => {
		const isReady = handle.ready();
    if (isReady) {
			var itemTallies = [];
			const menuThisWeek = Items.find({"active": true}, { fields: { name: 1 }}).fetch();
			menuThisWeek.forEach((item) => {;
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

Template.Orders_sidebar.helpers({
	thisWeek() {
		return Session.equals('state', "thisWeeksOrders");
	},

	showTallies() {
		return Template.instance().showTallies.get();
	},

	itemsThisWeek() {
		return Template.instance().itemInfo.get();
	},
});

Template.Orders_sidebar.events({
	'click .showTallies' (event, template) {
		event.preventDefault();

		template.showTallies.set(true);
	},

	'click .hideTallies' (event, template) {
		event.preventDefault();
		
		template.showTallies.set(false);
	},

	'click .newOrder' (event) {
		event.preventDefault();

		// Meteor.call('updateAllSubscriptions', ( error, response ) => {
		// 	if (error) {
		// 		console.log(error);
		// 	};
		// });
	},

	'click .thisWeeksOrders' (event, template) {
		event.preventDefault();

		Session.set('state', 'thisWeeksOrders');
	},

	'click .allOrders' (event, template) {
		event.preventDefault();

		Session.set('state', 'allOrders');
	},
});