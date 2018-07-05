import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from '/imports/ui/routes.js'
import { Session } from 'meteor/session';
import moment from 'moment';
import Isotope from 'isotope-layout';

// Collections
import { Items } from '/imports/api/items/items.js';
import { Menus } from '/imports/api/menus/menus.js';

// Components
import '/imports/ui/components/filters/filters.js';
import '/imports/ui/components/cart/cart.js';
import '/imports/ui/components/menu-item/menu-item.js';
import '/imports/ui/components/menu-toolbar/menu-toolbar.js';

// Methods
import { insertOrder } from '/imports/api/orders/methods.js';

// Helpers
import { cartSlots } from '/imports/ui/lib/helpers.js';

import './menu-page.less';
import './menu-page.html';

Template.Menu_page.onCreated(function menuPageOnCreated() {
	const afterWednes = moment().day() > 3;
  const sundayBeforeNoon = moment().day() === 0 && moment().hour() < 12;
  if (afterWednes || sundayBeforeNoon) Session.set('customizable', false);

	Session.set('processing', false);
	var filters = {
		diet: 'Omnivore',
		restrictions: {
			peanuts: false,
			treenuts: false,
			soy: false,
			beef: false,
			chicken: false,
			fish: false,
			shellfish: false,
			milk: false,
			eggs: false,
			wheat: false,
		},
	};

	Session.setDefault('filters', filters);
	Session.setDefault('selector',{});

	if (Session.get('orderId')) {
		// if hasItem and isPack
		var orderId = Session.get('orderId');
		if (orderId.status === 'pending-sub') {
			for (var i = orderId.items.length - 1; i >= 0; i--) {
				if (orderId.items[i].category === 'Pack') {
					if (orderId.items[i].sub_items.items.length === 0) {
						orderId.items.splice(i, 1);
					}
				}
			}
		};
		orderId.style = 'alacarte';
		Session.set('Order', orderId);
	};

	if (!Session.get('Order')) {
		const order = {
			user_id: Meteor.userId(),
			style: 'alacarte',
	    items: [],
	    week_of: moment().startOf('week').toDate(),
	    created_at: moment().toDate(),
		};

		Session.set('Order', order);
	};

  const thisWeeksStart = Session.get('Order') ? Session.get('Order').week_of : moment().startOf('week').toDate();

	this.autorun(() => {
		const handle = this.subscribe('Menus.active');

		if (handle.ready()) {
			// Set Session menu data if none
			var menu = Menus.findOne({active: true});
			var data = {
				_id: menu._id,
				ready_by: menu.ready_by,
				delivery_windows: menu.delivery_windows
			};

			Session.setDefault('menu', data);

			// 
			var order = Session.get('Order');
			var pack = Session.get('pack');

			// If unfull pack, pull up pack editor
			if (pack && pack.sub_items.items.length < pack.sub_items.schema.total) {
				Session.set('overlay', 'packEditor');
			};
		};
	});
});

Template.Menu_page.onRendered(function menuPageOnRendered() {
	
});

Template.Menu_page.onDestroyed(function menuPageOnDestroyed() {
	// Session.set('Back', Session.get('overlay'))
	Session.set('overlay', false);
});

Template.Menu_page.helpers({
	pack: ()=> {
		const order = Session.get('Order');
		const items = order.items;
		var hasPack = false;

		for (var i = items.length - 1; i >= 0; i--) {
			if (items[i].name.split('-')[1] === 'Pack') hasPack = true;
		}
		
		return hasPack;
	},

	filterMenuOpen: ()=> {
		return Session.get('filterMenuOpen');
	},

	packEditorOpen() {
		return Session.get('packEditorOpen');
	},

	cartOpen() {
		return Session.get('cartOpen');
	},

	notSubscribed() {
		return !(Session.get('subscribed'));
	},
});

Template.Menu_meals.helpers({
	meals: ()=> {
		var selector = {
			"category": "Meal",
		};
		const filtersObject = Session.get('filters').restrictions;
		const restrictions = Object.keys(filtersObject);
		for (var i = restrictions.length - 1; i >= 0; i--) {
			if (filtersObject[restrictions[i]]) {
				selector["warnings." + restrictions[i]] = false;
			}
		};

		return Items.find(selector, { sort: { rank: -1 }});
	},
});

Template.Menu_snacks.helpers({
	snacks: ()=> {
		return Items.find({category: 'Snack'});
	},
});

Template.Menu_drinks.helpers({
	drinks: () => {
		return Items.find({category: 'Drink'});
	},
});

Template.Menu_page.events({
	'click .getPack'(event) {
		event.preventDefault();

		if (Meteor.user()) { return Session.set('overlay', 'packEditor'); }
    Router.go('/join');
	},

	'click .edit-pack-cta'(event) {
		event.preventDefault();

		if (Meteor.user()) { return  Session.set('overlay', 'packEditor'); }
    Router.go('/join');
	},

	'click .toSubscribe'(event) {
		event.preventDefault();
		Router.go('/subscribe');
	},

	'click .toMarket'(event) {
		event.preventDefault();
		Router.go('/market');
	},

	'click .toCheckout' (event, template) {
    if (!Meteor.user()) { return Router.go('/join'); }
  	Session.set('processing', true);

  	const order = Session.get('Order');
  	const menu = Session.get('menu');

  	if (order._id && order.status === ('pending-sub' || 'skipped')) { // FIX Add custom sub
      // update order
      const updatedOrder = updatePendingSubOrder.call(order)
      Session.set('Order', updatedOrder);
    } else {

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
	  };

		Session.set('cartOpen', false);
    Router.go('/checkout');
	},

	'click #Menu-overlay'(event) {
		Session.set('cartOpen', false);
		Session.set('filterMenuOpen', false);
	},
});