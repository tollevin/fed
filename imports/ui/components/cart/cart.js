import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { Orders } from '/imports/api/orders/orders.js';
import { insertOrder } from '/imports/api/orders/methods.js';
import { cartSlots, countInArray } from '/imports/ui/lib/helpers.js';
import '/imports/ui/components/cart-item/cart-item.js';

import './cart.less';
import './cart.html';

Template.Cart.onCreated(function cartOnCreated() {
	this.autorun(() => {
	});
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
	subtotal: ()=> {
		var subtotal = 0;
		const order = Session.get('Order');

		for (var i = order.items.length - 1; i >= 0; i--) {
			subtotal += order.items[i].price_per_unit;
		};

		return subtotal.toFixed(2);
	},
});

Template.Cart.events({

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