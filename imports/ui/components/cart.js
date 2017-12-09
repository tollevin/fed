import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './cart.html';

import { Orders } from '../../api/orders/orders.js';
import { insertOrder } from '../../api/orders/methods.js';

import { cartSlots, countInArray } from '../lib/helpers.js';

Template.Cart.onCreated(function cartOnCreated() {
	this.autorun(() => {
		// Subscribe to the current User's data
    this.subscribe('items.thisWeek');
	});
});

Template.Cart.onRendered(function cartOnRendered() {
	//Set the Pack value in pack selector to selected pack
	$("#changePack").val(Session.get('PackSelected'));
});

Template.Cart.helpers({
	processing() {
		return Session.get('processing');
	},

	dishes() {
		if (Session.get('pack')) {
			var dishList = Session.get('pack').dishes;
			var dishTally = {};
			for (var i = dishList.length - 1; i >= 0; i--) {
				if (dishList[i] != '' && !dishTally[dishList[i]]) {
					dishTally[dishList[i]] = 1;
				} else if (dishList[i] != '') {
					dishTally[dishList[i]] += 1;
				};
			};
			var result = [];
	    for (var key in dishTally) result.push({name:key,value:dishTally[key]});
	    return result;
		};
	},

	snacks() {
		if (Session.get('pack')) {
			var snackList = Session.get('pack').snacks;
			var snackTally = {};
			for (var i = snackList.length - 1; i >= 0; i--) {
				if (snackList[i] != '' && !snackTally[snackList[i]]) {
					snackTally[snackList[i]] = 1;
				} else if (snackList[i] != '') {
					snackTally[snackList[i]] += 1;
				};
			};
			var result = [];
	    for (var key in snackTally) result.push({name:key,value:snackTally[key]});
	    return result;
		};
	},

	dishTally() {
		var totalDishes = Session.get('pack').dishes;
		var nullCount = 0;
		for (var i = totalDishes.length - 1; i >= 0; i--) {
			if (totalDishes[i].length === 0) {
				nullCount += 1;
			};
		};
		return "(" + (totalDishes.length - nullCount) + "/" + totalDishes.length + ")";
	},

	snackTally() {
		var totalSnacks = Session.get('pack').snacks;
		var nullCount = 0;
		for (var i = totalSnacks.length - 1; i >= 0; i--) {
			if (totalSnacks[i].length === 0) {
				nullCount += 1;
			};
		};
		return "(" + (totalSnacks.length - nullCount) + "/" + totalSnacks.length + ")";
	},

	// changedPack() {
	// 	Session.set('PackSelected', this.selectedIndex);
	// },

	selected() {
		if (this.value === Session.get('PackSelected')) {
			return 'selected';
		};
	},

	packEditorOpen() {
		return Session.get('packEditorOpen') && 'packEditorOpen';
	},

	ready() {
		if (Session.get('pack')) {
			const dishes = Session.get('pack').dishes;
			const snacks = Session.get('pack').snacks;
			const pack = dishes.concat(snacks);
			return pack.indexOf('') < 0 && 'ready';
		};
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

	'click #checkout' (event, template) {
    Session.set('processing', true);

    const packReady = Session.get('pack');
    const packDishes = packReady.dishes;
    const packSnacks = packReady.snacks;
    var ready = true;
    for (i = 0; i < packSnacks.length; i++) { 
    	if (!packSnacks[i]) {
    		// console.log('alert!');
    		sAlert.error("You've still got some space in your pack!");
    		ready = false;
    		break;
    	};
    };
    for (i = 0; i < packDishes.length; i++) { 
    	if (!packDishes[i]) {
    		// console.log('alert!');
    		sAlert.error("You've still got some space in your pack!");
    		ready = false;
    		break;
    	};
		};

		if (ready) {
			const orderToCreate = {
	    	userId: Meteor.userId(),
	    	packName: packReady.description,
	    	packPrice: packReady.price,
	    	packDishes: packReady.dishes,
	    	packSnacks: packReady.snacks
	    };

	    const orderId = insertOrder.call(orderToCreate);
	    Session.set('orderId', orderId);

	    FlowRouter.go('/checkout');
	  };

  	Session.set('processing', false);
	},
});