import './admin-layout.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Items } from '../../api/items/items.js';
import { Orders } from '../../api/orders/orders.js';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '../components/loading.js';

const CONNECTION_ISSUE_TIMEOUT = 6000;

// A store which is local to this file?
const showConnectionIssue = new ReactiveVar(false);

Meteor.startup(() => {
  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(() => {
    // FIXME:
    // Launch screen handle created in lib/router.js
    // dataReadyHold.release();

    // Show the connection error box
    showConnectionIssue.set(true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.Admin_layout.onCreated(function adminLayoutOnCreated() {
  Session.setDefault({
    adminMenuOpen: false,
    processing: false,
  });
});

Template.Admin_layout.onRendered(function adminLayoutOnRendered() {
  // this.autorun(() => {
  //   var w = $(window).width();
  //   if (Session.get('navOpen') && w > 785) {
  //     const nav = $('.main-nav ul');
  //     nav.slideToggle();
  //     Session.set('navOpen', false);
  //   };
  // });
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
  // activeMenuClass(menu) {
  //   const active = ActiveRoute.name('Menus.show')
  //     && FlowRouter.getParam('_id') === list._id;

  //   return active && 'active';
  // },
  connected() {
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },

  templateGesturesAdmin: {
    // 'swipeleft .content-overlay, #sideNav'(event, instance) {
    //   Session.set('sideNavOpen', false);
    // },
    // 'swiperight .content-overlay'(event, instance) {
    //   Session.set('packEditorOpen', false);
    // },
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
    Meteor.logout();
  },
});