import './admin-body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Items } from '/imports/api/items/items.js';
import { Orders } from '/imports/api/orders/orders.js';

import '/imports/ui/components/loading/loading.js';

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

Template.Admin_body.onCreated(function adminBodyOnCreated() {
  Session.setDefault({
    userMenuOpen: false,
    processing: false,
  });
});

Template.Admin_body.onRendered(function adminBodyOnRendered() {
  // this.autorun(() => {
  //   var w = $(window).width();
  //   if (Session.get('navOpen') && w > 785) {
  //     const nav = $('.main-nav ul');
  //     nav.slideToggle();
  //     Session.set('navOpen', false);
  //   };
  // });
});

Template.Admin_body.helpers({
  isAdmin () {
    return Meteor.user() && Meteor.user().emails[0].address.slice(-14) === "@getfednyc.com" && Meteor.user().emails[0].verified;
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
  userMenuOpen() {
    return Session.get('userMenuOpen');
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
    'swipeleft .cordova'(event, instance) {
      instance.state.set('menuOpen', false);
    },
    'swiperight .cordova'(event, instance) {
      instance.state.set('menuOpen', true);
    },
  },
});

Template.Admin_body.events({
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