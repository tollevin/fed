import { Accounts } from 'meteor/accounts-base';
import { signin } from '/imports/ui/lib/auth.js';
import { Router } from '/imports/ui/routes.js'

import './signup.html';

Template.SignUp.onCreated(function signUpOnCreated() {
  if(Meteor.userId()){
    Router.go('/');
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
        signin(user, ( error ) => {
          if (error) {
            console.log(error);
          };
        });
      };
    });
  },
});
