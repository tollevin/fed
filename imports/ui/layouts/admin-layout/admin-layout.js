import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { signout } from '/imports/ui/lib/auth.js';
import { Session } from 'meteor/session';

import '/imports/ui/components/loading/loading.js';

import './admin-layout.less';
import './admin-layout.html';

import { showConnectionIssue } from '/imports/ui/connectionIssue.js';

Template.Admin_layout.onCreated(function adminLayoutOnCreated() {
  Session.setDefault({
    adminMenuOpen: false,
    processing: false,
  });
});

Template.Admin_layout.onRendered(function adminLayoutOnRendered() {
  window.prerenderReady = true;
});

Template.Admin_layout.helpers({
  isAdmin () {
    return Meteor.user() && Meteor.user().emails[0].address.slice(-14) === '@getfednyc.com' && Meteor.user().emails[0].verified;
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
    'swiperight #container'() {
      Session.set('adminMenuOpen', true);
    },
    'swipeleft #container, #admin-side-menu'() {
      Session.set('adminMenuOpen', false);
    },
  },
});

Template.Admin_layout.events({
  'click #AllOrders-tab'() {
    Session.set('state', 'allOrders');
  },

  'click #ThisWeeksOrders-tab'() {
    Session.set('state', 'thisWeeksOrders');
  },

  'click #Active-Subs'() {
    Session.set('substate', 'active');
  },

  'click #Canceled-Subs'() {
    Session.set('substate', 'canceled');
  },

  'click .js-menu'(event, templateInstance) {
    templateInstance.state.set('menuOpen', !templateInstance.state.get('menuOpen'));
  },

  'click .content-overlay'(event, templateInstance) {
    templateInstance.state.set('userMenuOpen', false);
    event.preventDefault();
  },

  'click .js-user-menu'(event) {
    Session.set('userMenuOpen', !Session.get('userMenuOpen'));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click .js-logout'() {
    signout();
  },
});
