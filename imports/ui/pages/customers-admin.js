import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './customers-admin.html';

// Components used inside the template
import '../components/customers-toolbar.js';
import '../components/customer-preview.js';
import '../components/subscriber-preview.js';

Template.Customers_admin.onCreated(function customersAdminOnCreated() {
	Session.set('page', 'All');

  this.autorun(() => {
  	this.subscribe('userData');

  	if (!Meteor.userId()) {
  		FlowRouter.go('/');
  	};
  });

  Session.setDefault('page', "All");
});

Template.Customers_admin.helpers({
	AllCustomers() {
		return Session.equals('page', "All");
	},

	AllSubs() {
		return Session.equals('page', "AllSubs");
	},

	users() {
		return Meteor.users.find({},{ sort: { "createdAt": -1 }});
	},

	subscribers() {
		// const new_subs = Meteor.users.find({"subscriptions.status": "trialing", "skipping": null }, { sort: { "subscriptions.created": -1 }}).fetch();
		// const active = Meteor.users.find({"subscriptions.status": "active"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const past_due = Meteor.users.find({"subscriptions.status": "past_due"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const unpaid = Meteor.users.find({"subscriptions.status": "unpaid"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const skipping = Meteor.users.find({"subscriptions.status": "unpaid"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const canceled = Meteor.users.find({"subscriptions.status": "canceled"}, { sort: { "subscriptions.created": -1 }}).fetch();
		return Meteor.users.find({"subscriptions.quantity": { $gt: 0 }, "subscriptions.status": { $ne: "canceled" }}, { sort: { "subscriptions.created": -1 }});
	},

	numberOfSubscribers() {
		return Meteor.users.find({"subscriptions.quantity": { $gt: 0 }}).count();
	},

	numberOfCustomers() {
		return Meteor.users.find({}).count();
	},

	thisWeeksSubscribers() {
		return Meteor.users.find({"subscriptions.quantity": { $gt: 0 }, "skipping": false});
	},
});

Template.Customers_admin.events({
	'click #AllCus'(event, template) {
		Session.set('page', "All")
	},

	'click #AllSubs'(event, template) {
		Session.set('page', "AllSubs")
	},
});