import { Template } from 'meteor/templating';
import { Orders } from '/imports/api/orders/orders.js';
import { Session } from 'meteor/session';

import moment from 'moment';
import 'moment-timezone';

// Components used inside the template
import '/imports/ui/components/order-preview/order-preview.js';

// Template
import './orders-admin.html';

Template.Orders_admin.onCreated(function ordersAdminOnCreated() {
  // Set reactive variables for template
  Session.setDefault('state', 'thisWeeksOrders');

  this.autorun(() => {
    if (Session.get('state') === 'thisWeek') {
      const timestamp = moment().format();
      this.subscribe('thisWeeks.orders', timestamp);
    } else {
      this.subscribe('some.orders', 100);
    }

    this.subscribe('userData');
  });
});

Template.Orders_admin.helpers({
  allOrders() {
    return Session.equals('state', 'allOrders');
  },

  thisWeeksOrders() {
    return Session.equals('state', 'thisWeeksOrders');
  },

  orders() {
    return Orders.find({}, { sort: { status: 1, id_number: -1 } });
  },

  currentOrders() {
  	const lastSunday = moment().tz('America/New_York').startOf('week').toDate();
  	return Orders.find({ week_of: lastSunday }, { sort: { status: -1, created_at: -1 } });
  },
});
