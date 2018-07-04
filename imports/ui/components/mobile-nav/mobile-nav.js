import './mobile-nav.html';

import { signout } from '/imports/ui/lib/auth.js';

Template.Mobile_Nav.onCreated(function menuItemOnCreated() {
});

Template.Mobile_Nav.helpers({

  currentPage(page) {
    const route = FlowRouter.getRouteName();
    const active = page === route;
    return active && 'active';
  },
});

Template.Mobile_Nav.events({
  'click #logout'(event) {
    event.preventDefault();
    // event.stopImmediatePropagation();
    signout();
  },
});