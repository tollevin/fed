import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

// Components
import '/imports/ui/components/order-detail-panel/order-detail-panel.js';
import '/imports/ui/components/order-toggle/order-toggle.js';

// Collections
import { Orders } from '/imports/api/orders/orders.js';

// Template
import './user-home.less';
import './user-home.html';

Template.User_home.onCreated(function userHomeOnCreated() {
  if (!Meteor.userId()) {
    FlowRouter.go('signin');
  }

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

Template.User_home.helpers({
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
