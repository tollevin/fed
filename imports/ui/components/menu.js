import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import moment from 'moment';
import Isotope from 'isotope-layout';

import './menu.html';

// Components
import './menu-item.js';

// Collections
import { Items } from '../../api/items/items.js';
import { Menus } from '../../api/menus/menus.js';

Template.Menu.onCreated(function menuOnCreated() {
	const thisWeeksStart = moment().startOf('week').toDate();

	this.autorun(() => {
		this.subscribe('Menus.thisWeek', thisWeeksStart);
		// var filterObject = Session.get('filters').restrictions;
		// var restrictions = Object.keys(filterObject);
		// var filters = ()=> {
		// 	var result = '';

		// 	for (var i = restrictions.length - 1; i >= 0; i--) {
		// 		if (filterObject[restrictions[i]]) {
		// 			result.concat("':not(." + restrictions[i] + ")'")
		// 		}
		// 	};

		// 	console.log(result);
		// 	return result;
		// };
		// filters();
	});
});

Template.Menu.onRendered(function menuOnRendered() {
	// var iso = new Isotope( '#Menu-items', {
	//   itemSelector: '.menu-item',
	//   layoutMode: 'fitRows'
	// });
});

Template.Menu.helpers({
	filterString: ()=> {
		return Session.get('filters').iso;
	},
});

Template.Menu_meals.helpers({
	beef: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Beef';
		console.log(selector);
		return Items.find(selector);
	},

	chicken: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Chicken';
		return Items.find(selector);
	},

	fish: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Fish';
		return Items.find(selector);
	},

	soy: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Soy';
		return Items.find(selector);
	},

	vegetable: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Vegetable';
		return Items.find(selector);
	},

	grain: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Grain';
		return Items.find(selector);
	},

	soup: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Soup';
		return Items.find(selector);
	},

	salad: ()=> {
		var selector = {};
		selector.category = 'Meal';
		selector.subcategory = 'Salad';
		return Items.find(selector);
	},
});

Template.Menu_snacks.helpers({
	snacks: ()=> {
		return Items.find({category: 'Snack'});
	},
});

Template.Menu_drinks.helpers({
	drinks: ()=> {
		return Items.find({category: 'Drink'});
	},
});

Template.Menu_packs.helpers({
	packs: ()=> {
		return Items.find({category: 'Pack'});
	},
});