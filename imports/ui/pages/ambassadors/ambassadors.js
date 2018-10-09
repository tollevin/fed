import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { signin } from '/imports/ui/lib/auth.js';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { sAlert } from 'meteor/juliancwirko:s-alert';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

import './ambassadors.less';
import './ambassadors2.html';

Template.Ambassadors.onCreated(function equinoxJoinOnCreated() {
  Session.set('cartOpen', false);
});

Template.Ambassadors.helpers({
  first_name: () => Meteor.user() && Meteor.user().first_name,
  last_name: () => Meteor.user() && Meteor.user().last_name,
  phone: () => Meteor.user() && Meteor.user().phone,
  email: () => Meteor.user() && Meteor.user().emails[0].address,
  noUser: () => !Meteor.user(),
});

Template.Ambassadors.events({
  'submit form' (event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    const user = {
      first_name: templateInstance.find('[name="customer.firstName"]').value,
      last_name: templateInstance.find('[name="customer.lastName"]').value,
      phone: templateInstance.find('[name="customer.phone"]').value,
      email: templateInstance.find('[name="customer.email"]').value,
      password: templateInstance.find('[name="customer.pword"]') && templateInstance.find('[name="customer.pword"]').value,
      zipCode: templateInstance.find('[name="customer.address.zipCode"]') && templateInstance.find('[name="customer.address.zipCode"]').value,
      comments: templateInstance.find('[name="customer.comments"]').value,
      referrer: 'Equinox', // FIX
      ambassador: 'pending',
    };

    Meteor.call('createAmbassador', user, (error) => {
      if (error) {
        Session.set('loading', false);
        return $('#Errors').text(error.reason);
      }

      Session.set('loading', false);
      sAlert.success("Thanks for signing up! Please check your email for details, and we'll get back to you soon.", { timeout: 3000, onClose() { FlowRouter.go('/'); } });
      // return signin(user, (signinError) => {
      //   if (signinError) { return $('#Errors').text(signinError); }
      //
      // });
    });
  },
});
