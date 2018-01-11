import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';

import './menu-page.html';

// Menus collection
import { Items } from '../../api/items/items.js';

// Components used inside the template
import '../components/cart.js';
import '../components/menu-item.js';
import '../components/menu-snack.js';
import '../components/menu-toolbar.js';

import { cartSlots } from '../lib/helpers.js';

Template.Menu_page.onCreated(function menuPageOnCreated() {
	Session.setDefault('PackSelected', false);
	Session.set('processing', false);
	var filters = {
		diet: false,
		avoid: []
	};
	Session.setDefault('filtered', filters);

	this.autorun(() => {
		// should be this week's menu only
		this.subscribe('items.thisWeek');
		var subs = this.subscribe('thisUserData');
		if (subs.ready()) {
			var subscribed = Meteor.user() && Meteor.user().subscriptions && ['active', 'trialing'].indexOf(Meteor.user().subscriptions.status) > -1;

	    //Set up the number of cart slots depending on pack size
			if (!Session.get('pack')) {
		    
		    if (subscribed) {
		    	const subPack = Meteor.user().subscriptions.plan.id.split('PP')[0] + "-Pack";
		    	Session.set('PackSelected', subPack);
		    } else if (!Meteor.userId()) {
		    	Session.setDefault('PackSelected', '6-Pack');
		    } else {
		    	Session.set('PackSelected', '8-Pack');
		    };

	    	cartSlots();
			};

			var thisOrder = Session.get('pack');
			var pack = thisOrder.dishes;
			var dishesInPack = [];
			for (var i = pack.length - 1; i >= 0; i--) {
				if (pack[i].length > 1) {
					dishesInPack.push(pack[i]);
				}
			};
			var dishesLength = dishesInPack.length;

			// Open cart if cart is full
			if (dishesLength === pack.length) {
				Session.set('packEditorOpen', true);
			};
		};
	});

	const today = new moment();
	if (today.day() > 3) {
		Session.set('customizable', false);
	} else if (today.day() === 0 && today.hour() < 12) {
		Session.set('customizable', false);
	} else {
		Session.set('customizable', true);
	};
});

Template.Menu_page.onRendered(function menuPageOnRendered() {
});

Template.Menu_page.helpers({
	pack: ()=> {
		return Session.get('PackSelected');  
	},

	dishItems: ()=> {
		var currentFilters = Session.get('filtered');
		const mongoSelector = {"course": "Dish"};
		if (currentFilters.diet) {
			// for (var i = currentFilters.diet.length - 1; i >= 0; i--) {
			if (currentFilters.diet === 'omnivore') {
				currentFilters.diet = false;
			} else {
				mongoSelector["attributes." + currentFilters.diet] = true;
			};
			// }
		};
		if (currentFilters.avoid.length > 0) {
			for (var i = currentFilters.avoid.length - 1; i >= 0; i--) {
				mongoSelector["warnings." + currentFilters.avoid[i]] = false;
			}
		};
		return Items.find(mongoSelector, { sort: { weight: -1 } });
	},

	snackItems: ()=> {
		return Items.find({"course": "Snack"});
	},

	packEditorOpen() {
		return Session.get('packEditorOpen');
	},

	// showModal: ()=> {
 	//  return Meteor.user() ? '' : 'showModal';
	// },

	notCustomizable() {
		return !(Session.get('customizable'));
	},
});

Template.Menu_page.events({
	'click .diet-filter-button'(event, template) {
		event.preventDefault();
		
		const dietButtons = template.findAll('.diet-filter-button');
		for (var i = dietButtons.length - 1; i >= 0; i--) {
      dietButtons[i].classList.remove('active');
    };
		event.target.classList.add('active');

		const filter = event.target.name.toLowerCase();
		const existingFilters = Session.get('filtered');

		switch (filter) {
      case "omnivore":
      	existingFilters.diet = false;
	      Session.set('filtered', existingFilters);
	      break;
	    case "high protein":
				existingFilters.diet = "highProtein";
				Session.set('filtered', existingFilters);
				break;
			case "pescetarian":
				template.find('[name="Beef"]').classList.add('active');
				template.find('[name="Chicken"]').classList.add('active');
				existingFilters.avoid.push('beef', 'chicken');
				Session.set('filtered', existingFilters);
				break;
	    default:
				existingFilters.diet = filter;
				Session.set('filtered', existingFilters);
				break;
		};
	},

	'click .avoid-filter-button'(event, template) {
		event.preventDefault();

		const filter = event.target.name.toLowerCase();
		var existingFilters = Session.get('filtered');
		const filterIndex = existingFilters.avoid.indexOf(filter);

		if (filterIndex > -1) {
			event.target.classList.remove('active');
			existingFilters.avoid.splice(filterIndex, 1);
			Session.set('filtered', existingFilters);
		} else {
			event.target.classList.add('active');
			existingFilters.avoid.push(filter);
			Session.set('filtered', existingFilters);
		};
	},
});