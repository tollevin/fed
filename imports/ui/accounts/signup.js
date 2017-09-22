import { Accounts } from 'meteor/accounts-base';

import './signup.html';

Template.SignUp.onCreated(function signUpOnCreated() {
  if(Meteor.userId()){
    FlowRouter.go('/');
  };

  Session.set('cartOpen', false);
});

Template.SignUp.onRendered(function signUpOnRendered() {
});

Template.SignUp.helpers({
});

Template.SignUp.events({
  'submit form' ( event, template ) {
    event.preventDefault();
    
    const user = {
      email: template.find( '[name="emailAddress"]' ).value,
      password: template.find( '[name="password"]' ).value,
      zipCode: template.find( '[name="zipCode"]' ).value,
    };

    Meteor.call('createSubscriber', user, ( error, response ) => {
      if ( error ) {
        console.log(error + "; error");
      } else {
        Meteor.loginWithPassword(user.email, user.password, ( error ) => {
          if (error) {
            console.log(error);
          } else {
            Session.set('trialable', true);
            FlowRouter.go('/free-trial');
          };
        });
      };
    });
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