import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import { moment } from 'meteor/momentjs:moment';

import './customers-toolbar.html';

Template.Customers_toolbar.onCreated(function customersToolbarOnCreated() {
  const timestamp = moment().toDate();

  this.subscribe('userSearchData');
  this.subscribe('Future.orders', timestamp);
  this.subscribe('Menus.toCome');
  this.subscribe('subscriberData');
});

Template.Customers_toolbar.helpers({
  settings: () => ({
    position: 'bottom',
    limit: 5,
    rules: [
      {
        token: '@',
        collection: Meteor.users,
        field: 'emails.address',
        matchAll: true,
        template: Template.userPill,
      },
      {
        token: ':',
        collection: Meteor.users,
        field: 'first_name',
        matchAll: true,
        template: Template.userPill,
        noMatchTemplate: Template.serverNoMatch,
      },
    ],
  }),
});

Template.Customers_toolbar.events({
  'autocompleteselect input'(event, templateInstance, doc) {
    FlowRouter.go('Customer.detail', { _id: doc._id });
  },
});
