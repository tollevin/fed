import './accounts-holder.html';

Template.Accounts_Holder.onCreated(function menuItemOnCreated() {
});

Template.Accounts_Holder.helpers({
	firstName() {
    return Meteor.user().first_name && ("Welcome, " + Meteor.user().first_name);
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    const username = email.slice(0, email.indexOf('@'));
    return ("Welcome, " + username);
  },
});

Template.Accounts_Holder.events({
	'click a'() {
		// Session.set('sideNavOpen', false);
	},

  'click .js-logout'(event) {
    // event.preventDefault();
    // event.stopImmediatePropagation();
    Meteor.logout();
  },
});