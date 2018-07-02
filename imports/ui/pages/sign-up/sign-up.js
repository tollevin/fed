import { Accounts } from 'meteor/accounts-base';
import { $ } from 'meteor/jquery';
import { signin } from '/imports/ui/lib/auth.js';

// Zip Codes
import { yesZips } from '/imports/api/delivery/zipcodes.js';

import './sign-up.html';

Template.Sign_up.onCreated(function sign_UpOnCreated() {
  Session.set('cartOpen', false);
});

Template.Sign_up.onRendered(function sign_UpOnRendered() {
});

Template.Sign_up.helpers({
});

Template.Sign_up.events({
  'submit form' ( event, template ) {
    event.preventDefault();
    
    const zip = template.find( '[name="zipCode"]' ).value;
    
    if (yesZips.indexOf(zip) >= 0){
      const user = {
        email: template.find( '[name="emailAddress"]' ).value,
        password: template.find( '[name="password"]' ).value,
        zipCode: zip,
        referrer: template.find( '[name="ref"]' ).value,
      };

      Meteor.call('referSubscriber', user, ( error, response ) => {
        if ( error ) {
          $('#Errors').text(error.reason);
        } else {
          signin(user, ( error ) => {
            if (error) {
              $('#Errors').text(error);
            };
          });
        };
      });
    } else {
      $('#Errors').text("Sorry. It looks like we don't deliver to your area yet."); // Validation error!
    };
  },
});