import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Components used inside the template
import '/imports/ui/components/customer-preview/customer-preview.js';

import './customers-view.html';

Template.Customers_view.onCreated(function customersViewOnCreated() {
	this.subscribe('newestUsers', 100);
});

Template.Customers_view.helpers({
	users() {
		return Meteor.users.find({},{ sort: { "createdAt": -1 }, limit: 100});
	},
});

Template.Customers_view.events({
	
});