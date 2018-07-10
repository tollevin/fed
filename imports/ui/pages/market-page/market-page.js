import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import moment from 'moment';

// Collections
import { Items } from '/imports/api/items/items.js';
import { Menus } from '/imports/api/menus/menus.js';

// Components
import '/imports/ui/components/filters/filters.js';
import '/imports/ui/components/cart/cart.js';
import '/imports/ui/components/menu-item/menu-item.js';
import '/imports/ui/components/menu-toolbar/menu-toolbar.js';

import './market-page.less';
import './market-page.html';

Template.Market_page.onCreated(function marketPageOnCreated() {
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
			var menu = Menus.findOne({});
			var data = {
				_id: menu._id,
				ready_by: menu.ready_by,
				delivery_windows: menu.delivery_windows
			};
			Session.setDefault('menu', data);
		};
	});
});

Template.Market_page.onRendered(function marketPageOnRendered() {
});

Template.Market_page.helpers({
	filterMenuOpen: ()=> {
		return Session.get('filterMenuOpen');
	},

	packEditorOpen() {
		return Session.get('packEditorOpen');
	},

	cartOpen() {
		return Session.get('cartOpen');
	},
});

Template.Market_meals.helpers({
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

Template.Market_snacks.helpers({
	snacks: ()=> {
		return Items.find({category: 'Snack'});
	},
});

Template.Market_drinks.helpers({
	drinks: ()=> {
		return Items.find({category: 'Drink'});
	},
});

Template.Market_packs.helpers({
	packs: ()=> {
		return Items.find({category: 'Pack'});
	},
});
