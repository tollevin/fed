import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { signin } from '/imports/ui/lib/auth.js';
import { Session } from 'meteor/session';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

import './equinox-join.html';

Template.Equinox_join.onCreated(function equinoxJoinOnCreated() {
  Session.set('cartOpen', false);
});

Template.Equinox_join.events({
  'submit form' (event, template) {
    event.preventDefault();

    const zip = template.find('[name="zipCode"]').value.toString();
    const zipInRange = zipZones[zip];

    if (zipInRange) {
      const user = {
        email: template.find('[name="emailAddress"]').value,
        password: template.find('[name="password"]').value,
        zipCode: zip,
        referrer: 'Equinox',
      };

      Meteor.call('referUser', user, (error, response) => {
        if (error) {
          $('#Errors').text(error.reason);
        } else {
          signin(user, (error) => {
            if (error) {
              $('#Errors').text(error);
            } else {
              FlowRouter.go('/');
            }
          });
        }
      });
    } else {
      $('#Errors').text("Sorry. It looks like we don't deliver to your area yet."); // Validation error!
    }
  },
});
