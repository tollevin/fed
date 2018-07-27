import './app-body.html';
import './app-body.less';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';

import { toNewYorkTimezone } from '/imports/ui/lib/time';

// Collections
import { Orders } from '/imports/api/orders/orders.js';

// Components
import '/imports/ui/components/loader/loader.js';
import '/imports/ui/components/side-nav/side-nav.js';
import '/imports/ui/components/mobile-nav/mobile-nav.js';
import '/imports/ui/components/modals/modals.js';
import '/imports/ui/components/banner/banner.js';
import '/imports/ui/components/content-overlay/content-overlay.js';
import '/imports/ui/components/footer/footer.js';

import { showConnectionIssue } from '/imports/ui/connectionIssue.js';

Template.App_body.onCreated(function appBodyOnCreated() {
  Session.setDefault({
    processing: false,
    sideNavOpen: false,
    capped: false,
  });

  const timestamp = moment().toDate();

  this.subscribe('thisUserData');
  this.subscribe('thisUsersFuture.orders', timestamp);
  this.subscribe('Menus.toCome');

  this.autorun(() => {
    // var current = FlowRouter.current();
    Tracker.afterFlush(function () {
      $(window).scrollTop(0);
    });

    if (this.subscriptionsReady()) {
      // if a user has subscriptions,
      const user = Meteor.user();
      if (user && user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].status === 'active') {
        const week_of = toNewYorkTimezone(moment()).startOf('week').utc().toDate();

        const order_week_of = Orders.findOne({ week_of });

        if (!Session.get('orderId')) Session.set('orderId', order_week_of);

        Session.set('subscribed', true);
      } else {
        Session.set('subscribed', false);
      }
    }
  });
});

Template.App_body.onRendered(function appBodyOnRendered() {
  window.prerenderReady = true;
});

Template.App_body.helpers({
  notSubscribed() {
    return !Session.get('subscribed');
  },
  sideNavOpen() {
    return Session.get('sideNavOpen') && 'sideNavOpen';
  },
  packEditorOpen() {
    const route = FlowRouter.getRouteName();
    return route === 'Menu.show' && Session.get('packEditorOpen') && 'packEditorOpen';
  },
  processing() {
    return Session.get('processing');
  },
  cordova() {
    return Meteor.isCordova && 'cordova';
  },
  userMenuOpen() {
    return Session.get('userMenuOpen');
  },
  connected() {
    console.log('showConnectionIssue.get() = %j', showConnectionIssue.get());
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },

  templateGestures: {
    'swipeleft .content-overlay, #sideNav'(event, instance) {
      Session.set('sideNavOpen', false);
    },

    'swiperight #content-container, #cart'(event, instance) {
      const route = FlowRouter.getRouteName();
      if (Session.get('packEditorOpen')) {
        Session.set('packEditorOpen', false);
      } else {
        Session.set('sideNavOpen', true);
      }
    },
    'swipeleft #content-container'(event, instance) {
      const route = FlowRouter.getRouteName();
      if (route === 'Menu.show') {
        Session.set('packEditorOpen', true);
      }
    },
  },
});

Template.App_body.events({
  'click #container' (event) {
    Session.set('userMenuOpen', false);
    Session.set('sideNavOpen', false);
  },

  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },


  'click .welcome'(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    Session.set('userMenuOpen', !Session.get('userMenuOpen'));
    // stop the menu from closing
  },
});
