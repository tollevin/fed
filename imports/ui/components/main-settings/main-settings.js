import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import './main-settings.less';
import './main-settings.html';

// Collections
import { Orders } from '/imports/api/orders/orders.js';

Template.Main_settings.onCreated(function () {
  if (!Meteor.userId()) { FlowRouter.go('signin'); }

  this.nextOrder = new ReactiveVar();
  this.futureOrders = new ReactiveVar();

  this.autorun(() => {
    const orders = Orders.find({ status: { $nin: ['pending', 'canceled'] } }, { sort: { ready_by: 1 } }).fetch();
    if (!Session.get('orderId')) {
      Session.set('orderId', orders[0]);
    }
    this.nextOrder.set(Session.get('orderId'));
    this.futureOrders.set(orders.slice(1));
  });
});

Template.Main_settings.helpers({
  subscribed: () => {
    const user = Meteor.user();
    return user
      && user.subscriptions
      && user.subscriptions.filter(({ status }) => status !== 'canceled').length;
  },
  nextOrder() {
    return Template.instance().nextOrder.get();
  },

  futureOrders() {
    return Template.instance().futureOrders.get();
  },

  creditDollars() {
    const user = Meteor.user();
    if (!user) { return undefined; }
    return Math.floor(user.credit);
  },

  creditCents() {
    const user = Meteor.user();
    if (!user) { return undefined; }
    const credit = Math.round(user.credit * 100) / 100;
    const dollars = Math.floor(credit);
    const cents = Math.round((credit - dollars) * 100);
    return cents < 10 ? `0${cents}` : cents;
  },

  rate() {
    return false;
  },
});

Template.Main_settings.events({
  'click #cancel-subscription'() {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      Meteor.user().subscriptions
        .forEach((sub) => {
          Meteor.call('cancelSubscription', null, sub._id, () => { });
        });
    }
  },
});
