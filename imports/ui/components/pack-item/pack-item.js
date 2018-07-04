import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './pack-item.html';
import { Items } from '/imports/api/items/items.js';

Template.Pack_item.onCreated(function packItemOnCreated() {});

Template.Pack_item.helpers({});

Template.Pack_item.events({
	'click a' (event) {
		event.preventDefault();

		var routeName = FlowRouter.getRouteName();
		Session.set('previousRoute', routeName);

		var newRoute = '/menu/' + Template.currentData()._id;
		FlowRouter.go(newRoute);
	}
});