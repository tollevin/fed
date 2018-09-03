import { Template } from 'meteor/templating';
import { Orders } from '/imports/api/orders/orders.js';
import { Session } from 'meteor/session';

import { moment } from 'meteor/momentjs:moment';
import { toNewYorkTimezone } from '/imports/ui/lib/time';

// Components used inside the template
import '/imports/ui/components/order-preview/order-preview.js';

// Template
import './orders-admin.html';

Template.Orders_admin.onCreated(function ordersAdminOnCreated() {
  // Set reactive variables for template
  Session.setDefault('state', 'thisWeeksOrders');
  this.autorun(() => {
    const timestamp = moment().format();
    this.subscribe('allThisWeeks.orders', { timestamp });
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
    return Orders
      .find({}, { sort: { status: 1, id_number: -1 } })
      .fetch()
      .filter((order) => {
        if (Session.get('state') === 'thisWeeksOrders') {
          return true;
        }
        if (Session.get('state') === 'ordersPending') {
          return order.status === 'pending-sub';
        }
        if (Session.get('state') === 'ordersSkipped') {
          return order.status === 'skipped';
        }
        return true;
      });
  },

  currentOrders() {
    const lastSunday = toNewYorkTimezone(moment()).startOf('week').toDate();
    return Orders.find({ week_of: lastSunday }, { sort: { status: -1, created_at: -1 } });
  },
});
