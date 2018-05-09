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

  this.nextOrder = new ReactiveVar(Session.get('orderId'));

  const orders = Orders.find({}, {sort: {ready_by: 1}}).fetch();
  this.futureOrders = new ReactiveVar(orders.slice(1));

  // this.autorun(() => {
  // });
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
  // 'click #MainCTA' (event) {
  //   event.preventDefault();

  //   ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
  //     'id': 'test',
  //     'affiliation': 'Getfednyc.com',
  //     'revenue': '85.00',
  //     'tax': '5.00',
  //     'shipping': '13.00',
  //     'coupon': 'TestCoupon'
  //   });

  //   console.log('sent');
  // },
  
	'click #zipSubmit'(event, instance) {
    event.preventDefault();

    const zipInput = document.getElementById("zip").value.trim();

    if (yesZips.indexOf(zipInput) > -1 ) {
      Session.set('zipOk', true); 
      Session.set('zipNotYet', false);
    } else {
    	Session.set('zipNotYet', true);
    	Session.set('zipOk', false); 
    };
  },
});