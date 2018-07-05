import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { signin } from '/imports/ui/lib/auth.js';

// Zip Codes
import { yesZips } from '/imports/api/delivery/zipcodes.js';

// Template
import './sign-up-modal.less';
import './sign-up-modal.html';

Template.signUp_Modal.events({
	'click .close, click .modal-background' (event, template) {
		Session.set('needsZip', false);
	},

	// 'click .modal-content' (event) {
 //    event.stopImmediatePropagation();
	// },

	'change .zip' (event, template) {
		const zipInput = template.find('.zip');
		if (yesZips.indexOf(zipInput.value.toString()) < 0 ) {
			// alert user they are outside of our delivery range
			zipInput.style.backgroundColor = 'rgba(255, 102, 102,.4)';
      $('#SignUpModalForm').find('.signUp-errors').text("Sorry, it looks like you're outside our delivery area.");
    } else {
    	zipInput.style.backgroundColor = '#eee';
      $('#SignUpModalForm').find('.signUp-errors').text("");
    };
	},

	// 'keypress .zip' (event, template) {		
 //    const zipInput = template.find('.zip');

 //    if (event.which === 13 || zipInput.value.toString().length === 5) {
	// 		if (yesZips.indexOf(zipInput.value.toString()) < 0 ) {
	// 			// alert user they are outside of our delivery range
	// 			zipInput.style.backgroundColor = 'rgba(255, 102, 102,.4)';
	//       $('#SignUpModalForm').find('.signUp-errors').text("Sorry, it looks like you're outside our delivery area.");
	//     };
 //    } else {
 //    	zipInput.style.backgroundColor = '#eee';
 //      $('#SignUpModalForm').find('.signUp-errors').text("");
 //    };
	// },

	'submit #SignUpModalForm' (event, template) {
		event.preventDefault();
    // event.stopImmediatePropagation();

    Session.set('processing', true);
    const orderReady = Session.get('pack'); // Will Change when packs become items (FIX)

		const user = {
      email: $('.userEmail').val(),
      password: $('.pw').val(),
      zipCode: $('.zip').val(),
    };

    if (yesZips.indexOf(user.zipCode) < 0 ) {
      $('#SignUpModalForm').find('.signUp-errors').text("Sorry, it looks like you're outside our delivery area.");
  	} else {
      Meteor.call( 'createSubscriber', user, (error, response) => {
        if (error) {
          Session.set('loading', false);
          $('#SignUpModalForm').find('.signUp-errors').text(error.reason);
        } else {
          signin(user, (error) => {
          	if (error) {
          		sAlert.error('There was an error signing you in.')
          	} else {
          		$('.content-scrollable').scrollTop(0, 2000);
							Session.set('stage', 1);
							Session.set('signIn', false);
          	};
          });
        };
      });
    };
	},
});