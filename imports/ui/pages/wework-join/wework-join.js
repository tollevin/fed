import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { signin } from '/imports/ui/lib/auth.js';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

import './wework-join.html';

Template.WeWork_join.onCreated(function weworkJoinOnCreated() {
  Session.set('cartOpen', false);
});

Template.WeWork_join.events({
  'submit form' (event, templateInstance) {
    event.preventDefault();

    const zip = templateInstance.find('[name="zipCode"]').value.toString();
    const zipInRange = zipZones[zip];

    if (zipInRange) {
      const user = {
        email: templateInstance.find('[name="emailAddress"]').value,
        password: templateInstance.find('[name="password"]').value,
        zipCode: zip,
        referrer: 'WeWork',
      };

      Meteor.call('referUser', user, (error) => {
        if (error) { return $('#Errors').text(error.reason); }
        return signin(user, (signinError) => {
          if (signinError) { return $('#Errors').text(signinError); }
          return FlowRouter.go('/');
        });
      });
    } else {
      $('#Errors').text("Sorry. It looks like we don't deliver to your area yet."); // Validation error!
    }
  },
});
