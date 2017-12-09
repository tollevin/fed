import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Orders } from '../../api/orders/orders.js';

import './orders-admin.html';

// Components used inside the template
import '../components/orders-sidebar.js';
import '../components/order-preview.js';

Template.Orders_admin.onCreated(function ordersAdminOnCreated() {

	// Set reactive variables for template
  Session.setDefault('state', 'thisWeeksOrders');

  this.autorun(() => {
    if (Session.get('state') === 'thisWeek') {
      this.subscribe('thisWeeks.orders');
    } else {
      this.subscribe('some.orders', 100);
    };

    this.subscribe('userData');
  });
});

Template.Orders_admin.helpers({
	allOrders() {
		return Session.equals('state', 'allOrders');
	},

	thisWeeksOrders() {
		return Session.equals('state','thisWeeksOrders');
	},

	orders() {
    return Orders.find({}, {sort: {status: 1, id: -1}});
  },

  currentOrders() {
  	const lastSundayAtNoon = moment().day(0).hour(12).minute(1).second(0).toISOString();
  	return Orders.find({"createdAt": { $gte: new Date(lastSundayAtNoon) }}, { sort: { status: -1, id: -1 }});
  }
});

Template.Orders_admin.events({
});