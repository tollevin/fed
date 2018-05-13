import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

// Template
import './user-home.html';

// Components
import '../components/order-detail-panel.js';
import '../components/order-toggle.js';

// Collections
import { Orders } from '../../api/orders/orders.js';
import { DeliveryWindows } from '../../api/delivery/delivery-windows.js';

// Methods
import {
  // skipOrder,
  // autoinsertSubscriberOrder
} from '../../api/orders/methods.js';

Template.User_home.onCreated(function userHomeOnCreated() {

  if (!Meteor.userId()) {
    FlowRouter.go('signin');
  };

  this.nextOrder = new ReactiveVar();
  this.futureOrders = new ReactiveVar();

  this.autorun(() => {
    const orders = Orders.find({status:{$nin: ['pending', 'canceled']}}, {sort: {ready_by: 1}}).fetch();
    if (!Session.get('orderId')) {
      Session.set('orderId', orders[0]);
    };
    this.nextOrder.set(Session.get('orderId'));
    this.futureOrders.set(orders.slice(1));
  });
});

Template.User_home.onRendered(function userHomeOnRendered() {
  // if they received a pack, prompt to rate
});

Template.User_home.helpers({
  nextOrder() {
    return Template.instance().nextOrder.get();
  },

  futureOrders() {
    return Template.instance().futureOrders.get();
  },

  creditDollars() {
    const credit = Meteor.user().credit;
    return Math.floor(credit);
  },

  creditCents() {
    const credit = Meteor.user().credit;
    const dollars =  Math.floor(credit);
    var cents = (credit - dollars) * 100;
    return cents < 10 ? '0' + cents : cents;
  },

  rate() {
    return false;
  },
});

Template.User_home.events({
});