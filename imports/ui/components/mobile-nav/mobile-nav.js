import { Template } from 'meteor/templating';

import './mobile-nav.html';
import './mobile-nav.less';

import { signout } from '/imports/ui/lib/auth.js';

Template.Mobile_Nav.helpers({
  currentPage(page) {
    const route = FlowRouter.getRouteName();
    const active = page === route;
    return active && 'active';
  },
});

Template.Mobile_Nav.onRendered(() => {
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.navbar-fixed-top').fadeIn(2000, function() {
        $('.navbar-fixed-top').addClass('scrolled');
      });
    } else {
      $('.navbar-fixed-top').removeClass('scrolled');
    }
  });
});

Template.Mobile_Nav.events({
  'click #logout'(event) {
    event.preventDefault();
    // event.stopImmediatePropagation();
    signout();
  },
  'click #hamburger-menu' (event, template) {
    event.preventDefault();
    event.stopImmediatePropagation();
    Session.set('sideNavOpen', !Session.get('sideNavOpen'));
  },
});
