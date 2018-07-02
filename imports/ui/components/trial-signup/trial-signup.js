import { Accounts } from 'meteor/accounts-base';
import { $ } from 'meteor/jquery';
import { signin } from '/imports/ui/lib/auth.js';

// Zip Codes
import { yesZips } from '/imports/api/delivery/zipcodes.js';

import './trial-signup.html';

Template.Trial_signup.onCreated(function trialSignUpOnCreated() {
  Session.set('cartOpen', false);
});

Template.Trial_signup.onRendered(function trialSignUpOnRendered() {
});

Template.Trial_signup.helpers({
});

Template.Trial_signup.events({
  'submit form' ( event, template ) {
    event.preventDefault();
    
    const zip = template.find( '[name="zipCode"]' ).value;
    
    if (yesZips.indexOf(zip) >= 0){
      const user = {
        email: template.find( '[name="emailAddress"]' ).value,
        password: template.find( '[name="password"]' ).value,
        zipCode: zip,
      };

      Meteor.call('createSubscriber', user, ( error, response ) => {
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

// subscribeWithOnError = function () {
//   check(arguments[0], String);
//   var subName = arguments[0];
//   var subParams = [].slice.call(arguments, 1, arguments.length);
//   var params = [subName].concat(subParams);

//   params.push({
//     onError: function (e) {
//       if (e.error === 401) {
//         if (Meteor.user ()) {
//           sAlert.error("You are not permitted to view this page");
//           Router.current().next();
//         } else {
//           sAlert.warning("You must be logged in to view this page");
//           Router.go('Auth.login');
//         }
//         // ... etc
//       } else {
//         Router.current().render('error', {
//           data: {
//             message: "Unknown Error",
//             error: e
//           }
//         });
//       }
//     }
//   });

//   Meteor.subscribe.apply(Meteor, params);
// }