import './mobile-nav.html';

import { signout } from '/imports/ui/lib/auth.js';

Template.Mobile_Nav.onCreated(function menuItemOnCreated() {
});

Template.Mobile_Nav.helpers({
	// mobileNavOpen() {
 //    return Session.get('mobileNavOpen') && 'mobileNavOpen';
 //  },

 //  notSubscribed() {
 //    return !Session.get('subscribed');
 //  },

 //  subscribed() {
 //    return Session.get('subscribed');
 //  },

  currentPage(page) {
    const route = FlowRouter.getRouteName();
    const active = page === route;
    return active && 'active';
  },

  // showMenuLinks() {
  //   return Template.instance().showMenuLinks.get();
  // },

  // showAboutLinks() {
  //   return Template.instance().showAboutLinks.get();
  // },
});

Template.Mobile_Nav.events({
	// 'click a'() {
	// 	Session.set('mobileNavOpen', false);
	// },

 //  'mouseenter .shop-menu-link, .menu-link-ul'() {
 //    Template.instance().showMenuLinks.set(true);
 //  },

 //  'mouseenter .about-link, .about-link-ul'() {
 //    Template.instance().showAboutLinks.set(true);
 //  },

 //  'mouseleave #Main-Nav'() {
 //    const route = FlowRouter.getRouteName();
 //    const isNotMenuPage = 'Menu' != route.split('.')[0];
 //    const isNotAboutPage = 'About' != route.split('.')[0];

 //    if (isNotMenuPage) {
 //      Template.instance().showMenuLinks.set(false);
 //    };

 //    if (isNotAboutPage) {
 //      Template.instance().showAboutLinks.set(false);
 //    };
 //  },

  'click #logout'(event) {
    event.preventDefault();
    // event.stopImmediatePropagation();
    signout();
  },
});