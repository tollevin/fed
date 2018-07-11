import { Template } from 'meteor/templating';

import './menu-toolbar.less';
import './menu-toolbar.html';

Template.Menu_toolbar.onCreated(function menuToolbarOnCreated() {
	Session.setDefault('packEditorOpen', false);
	Session.setDefault('cartOpen', false);
});

Template.Menu_toolbar.helpers({
	dietFilter: ()=> {
		return Session.get('filters').diet;
	},

	userHasRestrictions: ()=> {
		return Session.get('filters').restrictions.length;
	},

	filterMenuOpen: ()=> {
		return Session.get('filterMenuOpen') && 'filterMenuOpen';
	},

	cartOpen: ()=> {
		return Session.get('cartOpen');
	},

	packEditorOpen: ()=> {
		return Session.get('packEditorOpen') && 'packEditorOpen';
	},

	hasPack: ()=> {
		const order = Session.get('Order');
		return order && order.style === 'pack';
	},

	dishesInPack: ()=> {
		const order = Session.get('Order');
		if (order && order.style === 'pack') {
			var items = order.items;
			if (items) {
				for (var i = items.length - 1; i >= 0; i--) {
					if (items[i].category.toLowerCase() === 'pack') {
						if (items[i].sub_items.schema.total >= items[i].sub_items.items.length) {
							return items[i].sub_items.items.length;
						};
					};
				};
			} else {
				return _;
			};
		};
	},

	packSize: ()=> {
		const order = Session.get('Order');
		if (order && order.style === 'pack') {
			var items = order.items;
			if (items) {
				for (var i = items.length - 1; i >= 0; i--) {
					if (items[i].category.toLowerCase() === 'pack') {
						if (items[i].sub_items.schema.total >= items[i].sub_items.items.length) {
							return items[i].sub_items.schema.total;
						};
					};
				};
			} else {
				return _;
			};
		};
	},
});

Template.Menu_toolbar.events({
	'click #Filter-menu-toggle'(event, template) {
		event.preventDefault();

		Session.set('filterMenuOpen', !Session.get('filterMenuOpen'));
		Session.set('cartOpen', false);
	},

	'click #Cart-toggle'(event, template) {
		event.preventDefault();

		Session.set('cartOpen', !Session.get('cartOpen'));
		Session.set('filterMenuOpen', false);
	},
});