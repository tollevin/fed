import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { $ } from 'meteor/jquery';

import { Items } from '../../api/items/items.js';

import './packs.html';
import '../components/footer.js';
import '../components/pack-item.js';
import '../components/modal.js';

import { insertOrder } from '../../api/orders/methods.js';

Template.Packs.onCreated(function packsOnCreated() {
	let template = Template.instance();
	Session.setDefault("PackSelected", false);
	Session.set("cartOpen", false);
	
	this.autorun(() => {
		this.subscribe('someUserData');
		if (Session.get('orderId')) {
			if (Session.get('orderId').status === 'pending') {
	      this.subscribe('single.order', Session.get('orderId')._id)
	    };
	  };
	  this.subscribe('items.thisWeek');
	});
});

Template.Packs.helpers({
	inActive() {
		const today = new Date();
		if (today.getDay() > 3) {
			return "inActive";
		};
	},

	omnivorePack() {
		return Items.find({ 'packs.omnivorePack': true }, { sort: { weight: -1 } })
	},

	vegetarianPack() {
		return Items.find({ 'packs.vegetarianPack': true }, { sort: { weight: -1 } })
	},

	popup() {
		return Session.get('needsZip');
	}
});

Template.Packs.events({
	'click .buy'(event, template) {
		event.preventDefault();

		var packSelection = event.target.id;

		if (packSelection === "StarterPack") {
			Session.set("PackSelected", packSelection);
			FlowRouter.go("/menu");
		} else {
			switch (packSelection) {
				case "OmnivorePack":
					var newOrder = {
						dishes: [],
						snacks: ["Cranberry Energy Bites"],
						price: 8500,
						description: "Fed Omnivore Pack",
					};
					const omniPackItems = Items.find({ 'packs.omnivorePack': true }).fetch();
					omniPackItems.forEach((item)=> {
						newOrder.dishes.push(item.name)
					});
					break;
				case "VegetarianPack":
					var newOrder = {
						dishes: [],
						snacks: ["Antioxidant Energy Bar"],
						price: 8500,
						description: "Fed Vegetarian Pack",
					};
					const vegPackItems = Items.find({ 'packs.vegetarianPack': true }).fetch();
					vegPackItems.forEach((item)=> {
						newOrder.dishes.push(item.name)
					});
					break;
		  };
		};

	  Session.set('order', newOrder);

		if (!Meteor.userId()) {
      Session.set('needsZip', true);
    } else {
    	Session.set('processing', true);
	    const orderReady = Session.get('order');

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

	    var data = {
	    	customer_zipcode: zip,
	    };

	    Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
	      if ( !error ) {
	      	Session.set('delivEstimate', response);
	      	FlowRouter.go('/checkout');
	      };
	    });

			Session.set('processing', false);
		};
	},
});