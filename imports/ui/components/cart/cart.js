import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { Orders } from '/imports/api/orders/orders.js';
import { insertOrder } from '/imports/api/orders/methods.js';
import { cartSlots, countInArray } from '/imports/ui/lib/helpers.js';
import '/imports/ui/components/cart-item/cart-item.js';

import './cart.html';

Template.Cart.onCreated(function cartOnCreated() {
	this.autorun(() => {
		// Subscribe to the current User's data
    // this.subscribe('items.thisWeek');
	});
});

Template.Cart.onRendered(function cartOnRendered() {
	//Set the Pack value in pack selector to selected pack
	$("#changePack").val(Session.get('PackSelected'));
});

Template.Cart.helpers({
	cartItems: ()=> {
		const order = Session.get('Order');
		var itemsObj = {};

		for (var i = order.items.length - 1; i >= 0; i--) {
			if (itemsObj[order.items[i]._id]) {
				itemsObj[order.items[i]._id].tally += 1;
			} else {
				const itemToAdd = {
					tally: 1,
					item: order.items[i],
				};

				itemsObj[order.items[i]._id] = itemToAdd;
			}
		};

		return Object.values(itemsObj);
	},

	upsellMessage: ()=> {

	},

	subtotal: ()=> {
		var subtotal = 0;
		const order = Session.get('Order');

		for (var i = order.items.length - 1; i >= 0; i--) {
			subtotal += order.items[i].price_per_unit;
		};

		return subtotal.toFixed(2);
	},

	// processing() {
	// 	return Session.get('processing');
	// },

	// dishes() {
	// 	if (Session.get('pack')) {
	// 		var dishList = Session.get('pack').dishes;
	// 		var dishTally = {};
	// 		for (var i = dishList.length - 1; i >= 0; i--) {
	// 			if (dishList[i] != '' && !dishTally[dishList[i]]) {
	// 				dishTally[dishList[i]] = 1;
	// 			} else if (dishList[i] != '') {
	// 				dishTally[dishList[i]] += 1;
	// 			};
	// 		};
	// 		var result = [];
	//     for (var key in dishTally) result.push({name:key,value:dishTally[key]});
	//     return result;
	// 	};
	// },

	// snacks() {
	// 	if (Session.get('pack')) {
	// 		var snackList = Session.get('pack').snacks;
	// 		var snackTally = {};
	// 		for (var i = snackList.length - 1; i >= 0; i--) {
	// 			if (snackList[i] != '' && !snackTally[snackList[i]]) {
	// 				snackTally[snackList[i]] = 1;
	// 			} else if (snackList[i] != '') {
	// 				snackTally[snackList[i]] += 1;
	// 			};
	// 		};
	// 		var result = [];
	//     for (var key in snackTally) result.push({name:key,value:snackTally[key]});
	//     return result;
	// 	};
	// },

	// dishTally() {
	// 	var totalDishes = Session.get('pack').dishes;
	// 	var nullCount = 0;
	// 	for (var i = totalDishes.length - 1; i >= 0; i--) {
	// 		if (totalDishes[i].length === 0) {
	// 			nullCount += 1;
	// 		};
	// 	};
	// 	return "(" + (totalDishes.length - nullCount) + "/" + totalDishes.length + ")";
	// },

	// snackTally() {
	// 	var totalSnacks = Session.get('pack').snacks;
	// 	var nullCount = 0;
	// 	for (var i = totalSnacks.length - 1; i >= 0; i--) {
	// 		if (totalSnacks[i].length === 0) {
	// 			nullCount += 1;
	// 		};
	// 	};
	// 	return "(" + (totalSnacks.length - nullCount) + "/" + totalSnacks.length + ")";
	// },

	// // changedPack() {
	// // 	Session.set('PackSelected', this.selectedIndex);
	// // },

	// selected() {
	// 	if (this.value === Session.get('PackSelected')) {
	// 		return 'selected';
	// 	};
	// },

	// packEditorOpen() {
	// 	return Session.get('packEditorOpen') && 'packEditorOpen';
	// },

	ready() {
		// var subtotal = 0;
		// const order = Session.get('Order');

		// for (var i = order.items.length - 1; i >= 0; i--) {
		// 	subtotal += order.items[i].price_per_unit;
		// };

		return 'ready';
	},
});

Template.Cart.events({
	'change #changePack'(event) {
		Session.set('PackSelected', event.target.value);
		cartSlots();
	},

	'click .remove-dish'(event, template) {
		
		const pack = Session.get('pack');
    const dishes = pack.dishes;
    const itemName = event.target.parentElement.closest(".dish-name").text;
    dishes[dishes.indexOf(itemName)] = '';
    pack.dishes = dishes;
    Session.set('pack', pack);
	},

	'click .remove-snack'(event, template) {
		oldPack = Session.get('pack');
		sncks = oldPack.snacks;
		sncks[event.target.name] = "";
		oldPack.snacks = sncks; 
		Session.set('pack', oldPack);
	},

	'click .ready' (event, template) {
    Session.set('processing', true);

  	const order = Session.get('Order');
  	const menu = Session.get('menu');

		const orderToCreate = {
    	user_id: Meteor.userId(),
    	menu_id: menu._id,
    	style: order.style,
    	week_of: order.week_of,
    	items: order.items,
    	subscriptions: order.subscriptions,
    };

    const orderId = insertOrder.call(orderToCreate);
    Session.set('Order', orderId);
		Session.set('cartOpen', false);

    FlowRouter.go('/checkout');
	},
});