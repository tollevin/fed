import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';

import './my-subscriptions.html';

Template.My_Subscriptions.onCreated(function mySubscriptionsOnCreated() {
	this.autorun(() => {
		this.subscribe('thisUserData');
	});
});

Template.My_Subscriptions.onRendered(function mySubscriptionsOnRendered() {
	
});

Template.My_Subscriptions.helpers({
});

Template.My_Subscriptions.events({

});