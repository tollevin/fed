import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import { signin } from '/imports/ui/lib/auth.js';

// Zip Codes
import { yesZips } from '/imports/api/delivery/zipcodes.js';

// Template
import './sign-up-modal.less';
import './sign-up-modal.html';

Template.signUp_Modal.events({
  'click .close, click .modal-background' () {
    Session.set('needsZip', false);
  },

  'change .zip' (event, templateInstance) {
    const zipInput = templateInstance.find('.zip');
    if (yesZips.indexOf(zipInput.value.toString()) < 0) {
      // alert user they are outside of our delivery range
      zipInput.style.backgroundColor = 'rgba(255, 102, 102,.4)';
      $('#SignUpModalForm').find('.signUp-errors').text("Sorry, it looks like you're outside our delivery area.");
    } else {
      zipInput.style.backgroundColor = '#eee';
      $('#SignUpModalForm').find('.signUp-errors').text('');
    }
  },

  'submit #SignUpModalForm' (event) {
    event.preventDefault();

    Session.set('processing', true);

    const user = {
      email: $('.userEmail').val(),
      password: $('.pw').val(),
      zipCode: $('.zip').val(),
    };

    if (yesZips.indexOf(user.zipCode) < 0) {
      $('#SignUpModalForm').find('.signUp-errors').text("Sorry, it looks like you're outside our delivery area.");
      return;
    }

    Meteor.call('createSubscriber', user, (error) => {
      if (error) {
        Session.set('loading', false);
        $('#SignUpModalForm').find('.signUp-errors').text(error.reason);
        return;
      }

      signin(user, (signInError) => {
        if (signInError) {
          sAlert.error('There was an error signing you in.');
          return;
        }

        $('.content-scrollable').scrollTop(0, 2000);
        Session.set('stage', 1);
        Session.set('signIn', false);
      });
    });
  },
});
