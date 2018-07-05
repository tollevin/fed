import { Accounts } from 'meteor/accounts-base';
import { $ } from 'meteor/jquery';
import { Router } from '/imports/ui/routes.js'
import { signin } from '/imports/ui/lib/auth.js';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

import './equinox-join.html';

Template.Equinox_join.onCreated(function equinoxJoinOnCreated() {
  Session.set('cartOpen', false);
});

Template.Equinox_join.onRendered(function equinoxJoinOnRendered() {
});

Template.Equinox_join.helpers({
});

Template.Equinox_join.events({
  'submit form' ( event, template ) {
    event.preventDefault();
    
    const zip = template.find( '[name="zipCode"]' ).value.toString();
    const zipInRange = zipZones[zip];
    
    if (zipInRange){
      const user = {
        email: template.find( '[name="emailAddress"]' ).value,
        password: template.find( '[name="password"]' ).value,
        zipCode: zip,
        referrer: "Equinox",
      };

      Meteor.call('referUser', user, ( error, response ) => {
        if ( error ) {
          $('#Errors').text(error.reason);
        } else {
          signin(user, ( error ) => {
            if (error) {
              $('#Errors').text(error);
            } else {
              Router.go('/');
            };
          });
        };
      });
    } else {
      $('#Errors').text("Sorry. It looks like we don't deliver to your area yet."); // Validation error!
    };
  },
});