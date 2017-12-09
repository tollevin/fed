import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './subscribers-admin.html';

// Components used inside the template
import '../components/subscriber-preview.js';

Template.Subscribers_admin.onCreated(function subscribersAdminOnCreated() {
  this.autorun(() => {
  	this.subscribe('subscriberData');
  });
});

Template.Subscribers_admin.helpers({
	subscribers() {
		// const new_subs = Meteor.users.find({"subscriptions.status": "trialing", "skipping": null }, { sort: { "subscriptions.created": -1 }}).fetch();
		// const active = Meteor.users.find({"subscriptions.status": "active"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const past_due = Meteor.users.find({"subscriptions.status": "past_due"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const unpaid = Meteor.users.find({"subscriptions.status": "unpaid"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const skipping = Meteor.users.find({"subscriptions.status": "unpaid"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const canceled = Meteor.users.find({"subscriptions.status": "canceled"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// return Meteor.users.find({"subscriptions.quantity": { $gt: 0 }, "subscriptions.status": { $ne: "canceled" }}, { sort: { "subscriptions.created": -1 }});
		return Meteor.users.find({}, { sort: { "subscriptions.created": -1 }});
	},

	numberOfSubscribers() {
		return Meteor.users.find({}).count();
	},
});

Template.Subscribers_admin.events({
});