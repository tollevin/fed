import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import { insertOrder } from '/imports/api/orders/methods.js';
import '/imports/ui/components/cart-item/cart-item.js';

import './cart.less';
import './cart.html';

Template.Cart.helpers({
	cartItems: ()=> {
		const order = Session.get('Order');
		var itemsObj =
      order.items.reduce((memo, item) => {
        let foundItem = memo[item._id] || {};
        return ({...memo, [item._id]: {tally: (foundItem.tally || 0) + 1, item}})
      }, {})

		return Object.values(itemsObj);
	},
	subtotal: ()=> {
		const order = Session.get('Order');
		return order.items.reduce((memo, item) => memo + item.price_per_unit, 0).toFixed(2);
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

  	const {style, week_of, items, subscriptions} = Session.get('Order');
  	const menu = Session.get('menu');

		const orderToCreate = {
    	user_id: Meteor.userId(),
    	menu_id: menu._id,
    	style,
      week_of,
      items,
      subscriptions,
    };

    const orderId = insertOrder.call(orderToCreate);
    Session.set('Order', orderId);
		Session.set('cartOpen', false);

    FlowRouter.go('/checkout');
	},
});