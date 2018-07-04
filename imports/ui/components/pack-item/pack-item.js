import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from '/imports/ui/routes.js'

import './pack-item.html';
import { Items } from '/imports/api/items/items.js';

Template.Pack_item.onCreated(function packItemOnCreated() {});

Template.Pack_item.helpers({});

Template.Pack_item.events({
	'click a' (event) {
		event.preventDefault();

		var routeName = Router.getRouteName();
		Session.set('previousRoute', routeName);

		var newRoute = '/menu/' + Template.currentData()._id;
		Router.go(newRoute);
	}
});