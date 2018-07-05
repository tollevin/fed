import { Orders } from '/imports/api/orders/orders.js';
import { Menus } from '/imports/api/menus/menus.js';

import { autoinsertSubscriberOrder } from '/imports/api/orders/methods.js';

import './customers-toolbar.html';

Template.Customers_toolbar.onCreated(function customersToolbarOnCreated() {
	const timestamp = moment().toDate();

  this.subscribe('userSearchData');
  this.subscribe('Future.orders', timestamp);
  this.subscribe('Menus.toCome');
  this.subscribe('subscriberData');
});

Template.Customers_toolbar.helpers({
	settings: ()=> {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          token: '@',
          collection: Meteor.users,
          field: "emails.address",
          matchAll: true,
          template: Template.userPill,
        },
        {
        	token: ':',
          collection: Meteor.users,
          field: "first_name",
          matchAll: true,
          template: Template.userPill,
          noMatchTemplate: Template.serverNoMatch,
        }
      ]
    };
  },
 });

Template.Customers_toolbar.events({
	'autocompleteselect input'(event, template, doc) {
    FlowRouter.go('Customer.detail', { _id: doc._id });
  }
});