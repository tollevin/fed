import './accounts-holder.html';

import { signout } from '/imports/ui/lib/auth.js';

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
	},

  'click .js-logout'(event) {
    signout();
  },
});