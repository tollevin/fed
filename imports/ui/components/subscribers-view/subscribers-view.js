import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

// Components used inside the template
import '/imports/ui/components/subscriber-preview/subscriber-preview.js';

import './subscribers-view.html';

Template.Subscribers_view.onCreated(function subscribersViewOnCreated() {
  this.subscribe('subscriberData');
  Session.setDefault('substate', 'active');
  this.autorun(() => {
    if (Session.equals('substate', 'canceled')) {
      this.subscribe('unsubscriberData');
    }
  });
});

Template.Subscribers_view.helpers({
  active() {
    return Session.equals('substate', 'active');
  },

  canceled() {
    return Session.equals('substate', 'canceled');
  },

  subscribers: () => Meteor.users.find({ subscriptions: { $exists: true } }, { sort: { 'subscriptions.created_at': -1 } }),

  unsubscribers: () => Meteor.users.find({ 'past_subscriptions.0': { $exists: true }, 'subscriptions.0': { $exists: false } }, { sort: { 'subscriptions.created_at': -1 } }),
});
