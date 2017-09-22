import './side-nav.html';

Template.Side_Nav.onCreated(function menuItemOnCreated() {
});

Template.Side_Nav.helpers({
	sideNavOpen() {
    return Session.get('sideNavOpen') && 'sideNavOpen';
  },

  notSubscribed() {
    return Session.get('unsubscribed');
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
	}
});