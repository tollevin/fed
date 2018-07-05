import { Router } from '/imports/ui/routes.js'
import './side-nav.html';

import { signout } from '/imports/ui/lib/auth.js';

Template.Side_Nav.onCreated(function menuItemOnCreated() {
  this.showMenuLinks = new ReactiveVar(false);
  this.showAboutLinks = new ReactiveVar(false);

  this.autorun(() => {
    const route = Router.getRouteName();
    const isMenuPage = 'Menu' === route.split('.')[0];
    const isAboutPage = 'About' === route.split('.')[0];
    
    if (isMenuPage) {
      this.showMenuLinks.set(true);
    };

    if (isAboutPage) {
      this.showAboutLinks.set(true);
    };
  });
});

Template.Side_Nav.helpers({
	sideNavOpen() {
    return Session.get('sideNavOpen') && 'sideNavOpen';
  },

  notSubscribed() {
    return !Session.get('subscribed');
  },

  subscribed() {
    return Session.get('subscribed');
  },

  currentPage(page) {
    const route = Router.getRouteName();
    const active = page === route;
    return active && 'active';
  },

  showMenuLinks() {
    return Template.instance().showMenuLinks.get();
  },

  showAboutLinks() {
    return Template.instance().showAboutLinks.get();
  },
});

Template.Side_Nav.events({
	'click a'() {
		Session.set('sideNavOpen', false);
	},

  'mouseenter .shop-menu-link, .menu-link-ul'() {
    Template.instance().showMenuLinks.set(true);
  },

  'mouseenter .about-link, .about-link-ul'() {
    Template.instance().showAboutLinks.set(true);
  },

  'mouseleave #Main-Nav'() {
    const route = Router.getRouteName();
    const isNotMenuPage = 'Menu' != route.split('.')[0];
    const isNotAboutPage = 'About' != route.split('.')[0];

    if (isNotMenuPage) {
      Template.instance().showMenuLinks.set(false);
    };

    if (isNotAboutPage) {
      Template.instance().showAboutLinks.set(false);
    };
  },

  'click #logout'(event) {
    event.preventDefault();
    // event.stopImmediatePropagation();
    signout();
  },
});