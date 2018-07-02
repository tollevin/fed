import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { signout } from '/imports/ui/lib/auth.js';

import '/imports/ui/components/loading/loading.js';

import './admin-layout.less';
import './admin-layout.html';

import { showConnectionIssue } from "/imports/ui/connectionIssue.js";

Template.Admin_layout.onCreated(function adminLayoutOnCreated() {
  Session.setDefault({
    adminMenuOpen: false,
    processing: false,
  });
});

Template.Admin_layout.onRendered(function adminLayoutOnRendered() {
});

Template.Admin_layout.helpers({
  isAdmin () {
    return Meteor.user() && Meteor.user().emails[0].address.slice(-14) === "@getfednyc.com" && Meteor.user().emails[0].verified;
  },

  adminMenuOpen() {
    return Session.get('adminMenuOpen') && 'admin-side-menu-open';
  },

  currentAdminPage(page) {
    const route = FlowRouter.getRouteName();
    const active = page === route;
    return active && 'active';
  },

  processing() {
    return Session.get('processing');
  },
  cordova() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },

  connected() {
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },

  templateGesturesAdmin: {

    'swiperight #container'(event, instance) {
      Session.set('adminMenuOpen', true);
    },
    'swipeleft #container, #admin-side-menu'(event, instance) {
      Session.set('adminMenuOpen', false);
    },
  },
});

Template.Admin_layout.events({
  'click #AllOrders-tab'(event, template) {
    Session.set('state', 'allOrders');
  },

  'click #ThisWeeksOrders-tab'(event, template) {
    Session.set('state','thisWeeksOrders');
  },

  'click #Active-Subs'(event, template) {
    Session.set('substate', 'active');
  },

  'click #Canceled-Subs'(event, template) {
    Session.set('substate', 'canceled');
  },

  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },

  'click .content-overlay'(event, instance) {
    instance.state.set('userMenuOpen', false);
    event.preventDefault();
  },

  'click .js-user-menu'(event, instance) {
    Session.set('userMenuOpen', !Session.get('userMenuOpen'));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click .js-logout'() {
    signout();
  },
});