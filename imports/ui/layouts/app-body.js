import './app-body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import '../components/cart.js';
import '../components/loader.js';
import '../components/side-nav.js';

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

  sAlert.config({
    effect: '',
    position: 'top-right',
    timeout: 5000,
    html: false,
    onRouteClose: true,
    stack: true,
    // or you can pass an object:
    // stack: {
    //     spacing: 10 // in px
    //     limit: 3 // when fourth alert appears all previous ones are cleared
    // }
    offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
    beep: false,
    // examples:
    // beep: '/beep.mp3'  // or you can pass an object:
    // beep: {
    //     info: '/beep-info.mp3',
    //     error: '/beep-error.mp3',
    //     success: '/beep-success.mp3',
    //     warning: '/beep-warning.mp3'
    // }
    onClose: _.noop //
    // examples:
    // onClose: function() {
    //     /* Code here will be executed once the alert closes. */
    // }
  });
});

Template.App_body.onCreated(function appBodyOnCreated() {
  Session.setDefault({
    cartOpen: false,
    userMenuOpen: false,
    processing: false,
    sideNavOpen: false,
    unsubscribed: true,
  });

  const handle = this.subscribe('limitedUserData');

  this.autorun(() => {
    const isReady = handle.ready();
    if (isReady) {
      if (Meteor.user() && Meteor.user().last_purchase) {
        Session.set('newUser', false);
      } else {
        Session.set('newUser', true);
      };

      if (Meteor.user() && Meteor.user().subscriptions && Meteor.user().subscriptions.status != "canceled") {
        Session.set('unsubscribed', false);
      } else {
        Session.set('unsubscribed', true);
      };
    };
  });
});

Template.App_body.onRendered(function appBodyOnRendered() {
  $(window).scroll(function(){                          
    if ($(this).scrollTop() > 100) {
      $(".navbar-fixed-top").fadeIn(2000, function() {
        $('.navbar-fixed-top').addClass('scrolled');
      });
    } else {
      $('.navbar-fixed-top').removeClass('scrolled');
    };
  });
});

Template.App_body.helpers({
  loading() {
    return Session.get('loading');
  },
  firstName() {
    return Meteor.user().first_name && ("Welcome, " + Meteor.user().first_name);
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    console.log(email);
    const username = email.slice(0, email.indexOf('@'));
    console.log(username);
    return ("Welcome, " + username);
  },
  notSubscribed() {
    return Session.get('unsubscribed');
  },
  sideNavOpen() {
    return Session.get('sideNavOpen') && 'sideNavOpen';
  },
  cartOpen() {
    return Session.get('cartOpen') && 'cartOpen';
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
  currentPage(page) {
    const route = FlowRouter.getRouteName();
    const active = page === route;
    return active && 'active';
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

  templateGestures: {
    'swipeleft .cordova'(event, instance) {
      Session.set('sideNavOpen', false);
    },
    'swiperight .cordova'(event, instance) {
      Session.set('sideNavOpen', true);
    },
  },
});

Template.App_body.events({
  'click #container' (event) {
    Session.set('userMenuOpen', false);
    Session.set('sideNavOpen', false);
  },

  'click #hamburger-menu' (event,template) {
    event.preventDefault();
    event.stopImmediatePropagation();
    Session.set('sideNavOpen', !Session.get('sideNavOpen'));
  },

  'click #sideNav span' (event) {
    event.preventDefault();
    Session.set('sideNavOpen', false);
  },

  'click #menuModal ul li' (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    Session.set('navOpen', false);
    var page = "/" + event.currentTarget.title;
    FlowRouter.go(page);
  },

  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },

  // 'click .content-overlay'(event, instance) {
  //   instance.state.set('userMenuOpen', false);
  //   instance.state.set('navOpen', false);
  //   event.preventDefault();
  // },

  'click #user-menu'(event, instance) {
    instance.state.set('userMenuOpen', !instance.state.get('userMenuOpen'));
  },

  'click .welcome'(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    Session.set('userMenuOpen', !Session.get('userMenuOpen'));
    // stop the menu from closing
  },

  'click .main-nav a'(event, instance) {
    const w = $(window).width();
    if (w < 785 && Session.get('navOpen')) {
      const nav = $('.main-nav ul');
      nav.slideToggle();
      Session.set('navOpen', false);
    };
  },

  'click .btns-group a'() {
    const w = $(window).width();
    if (w < 775 && (Session.get('navOpen'))) {
      const nav = $('.main-nav ul');
      nav.slideToggle();
      Session.set('navOpen', false);
    };
  },

  'click .js-logout'(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    Meteor.logout();
  },
});
