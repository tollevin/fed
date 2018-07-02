import './app-body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import moment from 'moment';
// import { Vue } from 'meteor/akryum:vue';

import 'moment-timezone';

// Collections
import { Orders } from '/imports/api/orders/orders.js';
import { Menus } from '/imports/api/menus/menus.js';

// Methods
import {
  findUserFutureOrders,
  autoinsertSubscriberOrder
} from '/imports/api/orders/methods.js';

// Components
import '/imports/ui/components/loader/loader.js';
import '/imports/ui/components/side-nav/side-nav.js';
import '/imports/ui/components/mobile-nav/mobile-nav.js';
import '/imports/ui/components/modals/modals.js';
import '/imports/ui/components/banner/banner.js';
import '/imports/ui/components/content-overlay/content-overlay.js';
import '/imports/ui/components/footer/footer.js';

const CONNECTION_ISSUE_TIMEOUT = 6000;

// A store which is local to this file?
const showConnectionIssue = new ReactiveVar(false);

// console.log("ActiveRoute.current()", ActiveRoute.current())

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
      if (user && user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].status === 'active' ) {
        // GET ORDER
        // const data = {
        //   user_id: Meteor.userId(),
        //   timestamp
        // };

        var week_of = moment().tz('America/New_York').startOf('week').utc().toDate();
        // var week_two = moment().tz('America/New_York').add(1,'week').startOf('week').utc().toDate();
        // var week_three = moment().tz('America/New_York').add(2,'week').startOf('week').utc().toDate();
        // var weeks = [week_of, week_two, week_three];

        // find future orders
        var order_week_of = Orders.findOne({week_of: week_of});
        // var order_week_two = Orders.findOne({week_of: week_two});
        // var order_week_three = Orders.findOne({week_of: week_three});
        // var orders = [order_week_of, order_week_two, order_week_three];

        // // if future orders are less than 3, populate pending-sub orders (DELETE AFTER CRON!)
        // let subItems;
        // Meteor.call('getUserSubscriptionItems', Meteor.userId(), ( error, response ) => {
        //   if ( error ) {
        //     console.log(error + "; error");
        //   } else {
        //     subItems = response;

        //     for (var j = orders.length - 1; j >= 0; j--) {
        //       if (!orders[j]) {
        //         var menu = Menus.findOne({online_at: weeks[j]});

        //         var data = {
        //           user_id: Meteor.userId(),
        //           menu_id: menu._id,
        //           week_of: weeks[j],
        //           items: subItems,
        //         };

        //         const subOrder = autoinsertSubscriberOrder.call(data);
        //         orders.splice(j, 1, subOrder);
        //       };
        //     };
        //   };
        // });

        // Session.setDefault('Order', orders[0]);
        if (!Session.get('orderId')) Session.set('orderId', order_week_of);

        Session.set('subscribed', true);
      } else {
        Session.set('subscribed', false);
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
  // currentPage(page) {
  //   const route = FlowRouter.getRouteName();
  //   const active = page === route;
  //   return active && 'active';
  // },
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
    'swipeleft .content-overlay, #sideNav'(event, instance) {
      Session.set('sideNavOpen', false);
    },
    // 'swiperight .content-overlay'(event, instance) {
    //   Session.set('packEditorOpen', false);
    // },
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
      };
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

  'click #user-menu a'(event, instance) {
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
});
