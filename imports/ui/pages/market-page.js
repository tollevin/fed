import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';
import Isotope from 'isotope-layout';

import './market-page.html';

// Collections
import { Items } from '../../api/items/items.js';
import { Menus } from '../../api/menus/menus.js';

// Components
import '../components/filters.js';
import '../components/cart.js';
import '../components/menu-item.js';
import '../components/menu-toolbar.js';

import { cartSlots } from '../lib/helpers.js';

Template.Market_page.onCreated(function marketPageOnCreated() {
	// Session.setDefault('PackSelected', false);
	// Session.setDefault('filterMarketOpen', false);
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

  // const thisWeeksStart = Session.get('Order') ? Session.get('Order').week_of : moment().startOf('week').toDate();

	this.autorun(() => {
		const handle = this.subscribe('Menus.active');

		if (handle.ready()) {
			var thisWeeksStart = moment().startOf('week').toDate();
			var menu = Menus.findOne({});
			var data = {
				_id: menu._id,
				ready_by: menu.ready_by,
				delivery_windows: menu.delivery_windows
			};
			Session.setDefault('menu', data);
		};

		// this.subscribe('items.active');
		// var subs = this.subscribe('thisUserData');
		// if (subs.ready()) {
		// 	var subscribed = Meteor.user() && Meteor.user().subscriptions;

	    //Set up the number of cart slots depending on pack size
			// if (!Session.get('Order')) {
		    
		 //    if (subscribed) {
		 //    	const subPack = Meteor.user().subscriptions.plan.id.split('PP')[0] + "-Pack";
		 //    	Session.set('PackSelected', subPack);
		 //    } else if (!Meteor.userId()) {
		 //    	Session.setDefault('PackSelected', '6-Pack');
		 //    } else {
		 //    	Session.set('PackSelected', '8-Pack');
		 //    };

	  //   	cartSlots();
			// };

			// var thisOrder = Session.get('pack');
			// var pack = thisOrder.dishes;
			// var dishesInPack = [];
			// for (var i = pack.length - 1; i >= 0; i--) {
			// 	if (pack[i].length > 1) {
			// 		dishesInPack.push(pack[i]);
			// 	}
			// };
			// var dishesLength = dishesInPack.length;

			// Open cart if cart is full
			// if (dishesLength === pack.length) {
			// 	Session.set('packFull', true);
			// };
		// };
	});

	// const today = new moment();
	// if (today.day() > 3) {
	// 	Session.set('customizable', false);
	// } else if (today.day() === 0 && today.hour() < 12) {
	// 	Session.set('customizable', false);
	// } else {
	// 	Session.set('customizable', true);
	// };
});

Template.Market_page.onRendered(function marketPageOnRendered() {
	
});

Template.Market_page.helpers({
	// pack: ()=> {
	// 	return Session.get('PackSelected');  
	// },

	filterMenuOpen: ()=> {
		return Session.get('filterMenuOpen');
	},

	packEditorOpen() {
		return Session.get('packEditorOpen');
	},

	cartOpen() {
		return Session.get('cartOpen');
	},

	// showModal: ()=> {
 	//  return Meteor.user() ? '' : 'showModal';
	// },

	// notCustomizable() {
	// 	return !(Session.get('customizable'));
	// },
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




Template.Market_page.events({
	// 'click #Filters-panel'(event) {
	// 	event.stopImmediatePropagation();
	// },

	// 'click .diet-filter-button'(event, template) {
	// 	event.preventDefault();

	// 	const dietButtons = template.findAll('.diet-filter-button');
	// 	for (var i = dietButtons.length - 1; i >= 0; i--) {
 //      dietButtons[i].classList.remove('active');
 //    };
	// 	event.target.classList.add('active');

	// 	const filter = event.target.name.toLowerCase();
	// 	const existingFilters = Session.get('filters');

	// 	switch (filter) {
 //      case "omnivore":
 //      	existingFilters.diet = false;
	//       Session.set('filters', existingFilters);
	//       break;
	//     case "high protein":
	// 			existingFilters.diet = "highProtein";
	// 			Session.set('filters', existingFilters);
	// 			break;
	// 		case "pescetarian":
	// 			template.find('[name="Beef"]').classList.add('active');
	// 			template.find('[name="Chicken"]').classList.add('active');
	// 			existingFilters.restrictions.push('beef', 'chicken');
	// 			Session.set('filters', existingFilters);
	// 			break;
	//     default:
	// 			existingFilters.diet = filter;
	// 			Session.set('filters', existingFilters);
	// 			break;
	// 	};
	// },

	// 'click .restrictions-filter-button'(event, template) {
	// 	event.preventDefault();

	// 	const filter = event.target.name.toLowerCase();
	// 	var existingFilters = Session.get('filters');
	// 	const filterIndex = existingFilters.restrictions.indexOf(filter);

	// 	if (filterIndex > -1) {
	// 		event.target.classList.remove('active');
	// 		existingFilters.restrictions.splice(filterIndex, 1);
	// 		Session.set('filters', existingFilters);
	// 	} else {
	// 		event.target.classList.add('active');
	// 		existingFilters.restrictions.push(filter);
	// 		Session.set('filters', existingFilters);
	// 	};
	// },

	'click #Menu-overlay'(event) {
		Session.set('cartOpen', false);
		Session.set('filterMenuOpen', false);
	},
});