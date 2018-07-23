import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { signout } from '/imports/ui/lib/auth.js';

import './side-nav.html';
import './side-nav.less';

Template.Side_Nav.onCreated(function menuItemOnCreated() {
  this.showMenuLinks = new ReactiveVar(false);
  this.showAboutLinks = new ReactiveVar(false);

  this.autorun(() => {
    const route = FlowRouter.getRouteName();
    const isMenuPage = route.split('.')[0] === 'Menu';
    const isAboutPage = route.split('.')[0] === 'About';

    if (isMenuPage) {
      this.showMenuLinks.set(true);
    }

    if (isAboutPage) {
      this.showAboutLinks.set(true);
    }
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
    const route = FlowRouter.getRouteName();
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
    const route = FlowRouter.getRouteName();
    const isNotMenuPage = route.split('.')[0] !== 'Menu';
    const isNotAboutPage = route.split('.')[0] !== 'About';

    if (isNotMenuPage) {
      Template.instance().showMenuLinks.set(false);
    }

    if (isNotAboutPage) {
      Template.instance().showAboutLinks.set(false);
    }
  },
  'click #sideNav span' (event) {
    event.preventDefault();
    Session.set('sideNavOpen', false);
  },

  'click #logout'(event) {
    event.preventDefault();
    // event.stopImmediatePropagation();
    signout();
  },
});
