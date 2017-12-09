import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './menu-toolbar.html';

Template.Menu_toolbar.onCreated(function menuToolbarOnCreated() {
	Session.setDefault('packEditorOpen', false);
	Session.setDefault('filterMenuOpen', false);
});

Template.Menu_toolbar.helpers({
	diets: ()=> {
		const diets = ['Omnivore', 'Vegetarian', 'Vegan', 'Pescetarian', 'Paleo'];
		return diets;
	},

	restrictions: ()=> {
		const restrictions = ['Peanuts', 'Shellfish', 'Milk', 'Eggs', 'Beef', 'Chicken', 'Fish', 'Soy', 'Wheat'];
		return restrictions;
	},

	goals: ()=> {
		const goals = ['Weight Loss', 'Weight Gain', 'Low-Carb'];
		return goals;
	},

	filterMenuOpen: ()=> {
		return Session.get('filterMenuOpen') && 'filterMenuOpen';
	},

	packEditorOpen: ()=> {
		return Session.get('packEditorOpen') && 'packEditorOpen';
	},

	dishesInPack: ()=> {
		if (Session.get('pack')) {
			var pack = Session.get('pack').dishes;
			var dishesInPack = [];
			for (var i = pack.length - 1; i >= 0; i--) {
				if (pack[i].length > 1) {
					dishesInPack.push(pack[i]);
				}
			};
			return dishesInPack.length;
		};
	},

	packSize: ()=> {
		if (Session.get('pack')) {
			return Session.get('pack').dishes.length;
		};
	},
});

Template.Menu_toolbar.events({
	'click #thisPack'(event) {
		event.preventDefault();

		Session.set('packEditorOpen', !Session.get('packEditorOpen'));
		Session.set('filterMenuOpen', false);
	},

	'click #Filter-menu-toggle'(event, template) {
		event.preventDefault();

		Session.set('filterMenuOpen', !Session.get('filterMenuOpen'));
		Session.set('packEditorOpen', false);
	},
});