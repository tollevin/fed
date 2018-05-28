import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './subscribers-view.html';

// Components used inside the template
import '../components/subscriber-preview.js';

Template.Subscribers_view.onCreated(function subscribersViewOnCreated() {
  this.subscribe('subscriberData');
});

Template.Subscribers_view.helpers({
	subscribers: ()=> {
		return Meteor.users.find({'subscriptions':{$exists: true}},{ sort: { "createdAt": -1 }});
	},
});

Template.Subscribers_view.events({
	
});