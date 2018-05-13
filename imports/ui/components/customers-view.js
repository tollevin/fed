import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './customers-view.html';

// Components used inside the template
import '../components/customer-preview.js';

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