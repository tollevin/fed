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

// Collections
import { Orders } from '../../api/orders/orders.js';
import { Menus } from '../../api/menus/menus.js';

// Methods
import {
  findUserFutureOrders,
  autoinsertSubscriberOrder
} from '../../api/orders/methods.js';

// Components
import '../components/loader.js';
import '../components/side-nav.js';
import '../components/mobile-nav.js';
import '../components/modals.js';
import '../components/content-overlay.js';
import '../components/footer.js';

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

      // delete?
      if (Meteor.user() && Meteor.user().last_purchase) {
        Session.set('newUser', false);
      } else {
        Session.set('newUser', true);
      };

      // if a user has subscriptions,
      if (Meteor.user() && Meteor.user().subscriptions && Meteor.user().subscriptions.length > 0) {
        // GET ORDER
        // const data = {
        //   user_id: Meteor.userId(),
        //   timestamp
        // };

        var week_of = moment().startOf('week').toDate();
        var week_two = moment().add(1,'week').startOf('week').toDate();
        var week_three = moment().add(2,'week').startOf('week').toDate();
        var weeks = [week_of, week_two, week_three];

        // find future orders
        var orders = Orders.find({}, {sort: {ready_by: 1}}).fetch();

        // if future orders are les than 3, populate pending-sub orders (DELETE AFTER CRON!)
        if (orders && orders.length < 3) {
          let subItems;
          Meteor.call('getUserSubscriptionItems', Meteor.userId(), ( error, response ) => {
            if ( error ) {
              console.log(error + "; error");
            } else {
              subItems = response;

              for (var j = orders.length; j < 3; j++) {
                var menu = Menus.findOne({online_at: weeks[j]});

                var data = {
                  user_id: Meteor.userId(),
                  menu_id: menu._id,
                  week_of: weeks[j],
                  items: subItems,
                };

                const subOrder = autoinsertSubscriberOrder.call(data);
                orders.push(subOrder);
              };
            };
          });          
        };

        // Session.setDefault('Order', orders[0]);
        Session.setDefault('orderId', orders[0]);

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
