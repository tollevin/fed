import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';

import './my-subscriptions.html';

// Collections
// import { Subscriptions } from '/imports/api/subscriptions/subscriptions.js';

// Components
// import '/imports/ui/components/subscription-preview.js';
// import '/imports/ui/components/subscription-toggle.js';

Template.My_Subscriptions.onCreated(function mySubscriptionsOnCreated() {
	this.autorun(() => {
		this.subscribe('thisUserData');
	});
});

Template.My_Subscriptions.onRendered(function mySubscriptionsOnRendered() {
	
});

Template.My_Subscriptions.helpers({
	// nextSubscription: ()=> {

	// },

	// futureSubscriptions: ()=> {

	// },
});

Template.My_Subscriptions.events({

});