import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Orders } from '../../api/orders/orders.js';
import moment from 'moment';
import 'moment-timezone';

// Template
import './orders-admin.html';

// Components used inside the template
import '../components/orders-sidebar.js';
import '../components/order-preview.js';

Template.Orders_admin.onCreated(function ordersAdminOnCreated() {

	// Set reactive variables for template
  Session.setDefault('state', 'thisWeeksOrders');

  this.autorun(() => {
    if (Session.get('state') === 'thisWeek') {
      const timestamp = moment().format();
      this.subscribe('thisWeeks.orders', timestamp);
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
    return Orders.find({}, {sort: {status: 1, id_number: -1}});
  },

  currentOrders() {
  	const lastSunday = moment().tz('America/New_York').startOf('week').toDate();
  	return Orders.find({week_of: lastSunday}, { sort: { status: -1, created_at: -1 }});
  }
});

Template.Orders_admin.events({
});