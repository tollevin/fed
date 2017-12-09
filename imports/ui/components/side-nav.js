import './side-nav.html';

Template.Side_Nav.onCreated(function menuItemOnCreated() {
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
});

Template.Side_Nav.events({
	'click a'() {
		Session.set('sideNavOpen', false);
	},

  'click .js-logout'(event) {
    // event.preventDefault();
    // event.stopImmediatePropagation();
    Meteor.logout();
  },
});