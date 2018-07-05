import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { $ } from 'meteor/jquery';

import { Items } from '/imports/api/items/items.js';
import { insertOrder } from '/imports/api/orders/methods.js';

import '/imports/ui/components/footer/footer.js';
import '/imports/ui/components/pack-item/pack-item.js';
import '/imports/ui/components/sign-up-modal/sign-up-modal.js';

import './packs.html';

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

	veganPack() {
		return Items.find({ 'packs.veganPack': true }, { sort: { weight: -1 } })
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
				case "VeganPack":
					var newOrder = {
						dishes: [],
						snacks: ["Antioxidant Energy Bar"],
						price: 8500,
						description: "Fed Vegan Pack",
					};
					const vPackItems = Items.find({ 'packs.veganPack': true }).fetch();
					vPackItems.forEach((item)=> {
						newOrder.dishes.push(item.name)
					});
					break;
		  };
		};

	  Session.set('pack', newOrder); // Will change when packs become items (FIX)

		if (!Meteor.userId()) {
      Session.set('needsZip', true);
    } else {
    	Session.set('processing', true);
	    const orderReady = Session.get('pack'); // Will change when packs become items (FIX)

			const orderToCreate = {
	    	userId: Meteor.userId(),
	    	packName: orderReady.description,
	    	packPrice: orderReady.price,
	    	packDishes: orderReady.dishes,
	    	packSnacks: orderReady.snacks
	    };

	    const orderId = insertOrder.call(orderToCreate);
	    Session.set('orderId', orderId);
	    FlowRouter.go('/checkout');

			Session.set('processing', false);
		};
	},
});