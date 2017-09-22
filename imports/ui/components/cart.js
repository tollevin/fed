import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './cart.html';

import { Orders } from '../../api/orders/orders.js';
import { insertOrder } from '../../api/orders/methods.js';

const cartSlots = function() {
	var newOrder = {
  	dishes: ['','','','','',''],
		snacks: [''],
		price: 8500,
		description: "Fed 6-Pack",
  };
	switch (Session.get('PackSelected')) {
    case "6-Pack":
      newOrder = {
      	dishes: ['','','','','',''],
				snacks: [''],
				price: 8500,
				description: "Fed 6-Pack",
      };
      break;
    case "8-Pack":
      newOrder = {
      	dishes: ['','','','','','','',''],
				snacks: [''],
				price: 11000,
				description: "Fed 8-Pack",
      };
      break;
    case "10-Pack":
      newOrder = {
      	dishes: ['','','','','','','','','',''],
				snacks: ['',''],
				price: 13500,
				description: "Fed 10-Pack",
      };
      break;
    case "12-Pack":
      newOrder = {
      	dishes: ['','','','','','','','','','','',''],
				snacks: ['',''],
				price: 15900,
				description: "Fed 12-Pack",
      };
    	break;
  };
  // Set the template for order data. Could replace with orderId
  Session.set('order', newOrder);
};

Template.Cart.onCreated(function cartOnCreated() {
	this.autorun(() => {
		// Subscribe to the current User's data
    this.subscribe('thisUserData');

    //Set up the number of cart slots depending on pack size
		if (!Session.get('order')) {
			cartSlots();
			Session.setDefault('PackSelected', '6-Pack');
		};

		var thisOrder = Session.get('order');
		var pack = thisOrder.dishes;
		var dishesInPack = [];
		for (var i = pack.length - 1; i >= 0; i--) {
			if (pack[i].length > 1) {
				dishesInPack.push(pack[i]);
			}
		};
		var dishesLength = dishesInPack.length;
		if (dishesLength === pack.length) {
			Session.set('packEditorOpen', true);
		};
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
		return Session.get('order').dishes;
	},

	snacks() {
		return Session.get('order').snacks;
	},

	label() {
		// totalItems = Session.get('order').dishes.length;
		return this.indexOf();
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
});

Template.Cart.events({
	'change #changePack'(event) {
		Session.set('PackSelected', event.target.value);
		cartSlots();
	},

	'click .reset-dish'(event, template) {
		oldOrder = Session.get('order');
		dishs = oldOrder.dishes;
		dishs[event.target.name] = "";
		oldOrder.dishes = dishs; 
		Session.set('order', oldOrder);
	},

	'click .reset-snack'(event, template) {
		oldOrder = Session.get('order');
		sncks = oldOrder.snacks;
		sncks[event.target.name] = "";
		oldOrder.snacks = sncks; 
		Session.set('order', oldOrder);
	},

	'click [data-service]' (event, template) {
    Session.set('processing', true);

    const orderReady = Session.get('order');
    const orderDishes = orderReady.dishes;
    const orderSnacks = orderReady.snacks;
    var ready = true;
    for (i = 0; i < orderSnacks.length; i++) { 
    	if (!orderSnacks[i]) {
    		// console.log('alert!');
    		sAlert.error("You've still got some space in your pack!");
    		ready = false;
    		break;
    	};
    };
    for (i = 0; i < orderDishes.length; i++) { 
    	if (!orderDishes[i]) {
    		// console.log('alert!');
    		sAlert.error("You've still got some space in your pack!");
    		ready = false;
    		break;
    	};
		};

		if (ready) {
			const orderToCreate = {
	    	userId: Meteor.userId(),
	    	packName: orderReady.description,
	    	packPrice: orderReady.price,
	    	packDishes: orderReady.dishes,
	    	packSnacks: orderReady.snacks
	    };

	    const orderId = insertOrder.call(orderToCreate);
	    Session.set('orderId', orderId);

	    var zip = Meteor.user().address_zipcode;
	    
	    if (!zip) {
	    	zip = Meteor.user().profile.zipCode;
	    };

	    const data = {
				customer_zipcode: zip,
	    };

	    Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
        if ( error ) {
          sAlert.error( error.reason );
          // console.log(error);
        } else {
        	Session.set('delivEstimate', response);
			    FlowRouter.go('/checkout');
        };
      });
	  };

  	Session.set('processing', false);
	},
});