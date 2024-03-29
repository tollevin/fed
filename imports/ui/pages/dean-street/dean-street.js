import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { signin } from '/imports/ui/lib/auth.js';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

// Zip Codes
import { getZipZones } from '/imports/api/delivery/zipcodes.js';

import './dean-street.less';
import './dean-street.html';

Template.DeanStreet.onCreated(function deanStreetOnCreated() {
  Session.set('cartOpen', false);
});

Template.DeanStreet.events({
  'submit form'(event, templateInstance) {
    event.preventDefault();

    const zip = templateInstance.find('[name="zipCode"]').value.toString();
    const zipInRange = getZipZones(zip);

    if (zipInRange) {
      const user = {
        email: templateInstance.find('[name="emailAddress"]').value,
        password: templateInstance.find('[name="password"]').value,
        zipCode: zip,
        referrer: 'DeanStreet',
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
