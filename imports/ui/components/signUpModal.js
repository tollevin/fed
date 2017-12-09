import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import './signUpModal.html';

// Zip Codes
import { yesZips } from '../../api/delivery/zipcodes.js';

import { insertOrder } from '../../api/orders/methods.js';

// Get the modal
// var modal = document.getElementById('signUpModal');

// Get the image and insert it inside the modal - use its "alt" text as a caption
// var img = document.getElementById('myImg');
// var modalImg = document.getElementById("img01");
// var captionText = document.getElementById("caption");
// img.onclick = function(){
//     modal.style.display = "block";
//     modalImg.src = this.src;
//     modalImg.alt = this.alt;
//     captionText.innerHTML = this.alt;
// }

// Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

Template.signUp_Modal.events({
	'click .close, click #signUpModal' (event) {
		Session.set('needsZip', false);
	},

	'click .modal-content' (event) {
    event.stopImmediatePropagation();
	},

	// 'keypress #zipField' (event, template) {
 //    if (event.which === 13) {
 //    	Session.set('processing', true);
	//     const orderReady = Session.get('order');

	// 		const orderToCreate = {
	//     	packName: orderReady.description,
	//     	packPrice: orderReady.price,
	//     	packDishes: orderReady.dishes,
	//     	packSnacks: orderReady.snacks
	//     };

	//     const zipInput = template.find('[id="zipField"]').value;
	//     var modal = document.getElementById('signUpModal');

	//     if (yesZips.indexOf(zipInput) < 0 ) {
	//       modal.innerHTML = "<p class='sorry'>Sorry, it looks like you're outside our delivery area.</p>"
	//     } else {
	//       modal.innerHTML = "<p class='alright'>Alright!<br>Almost done.</p>"
	//     };

	//     const orderId = insertOrder.call(orderToCreate);
	//     Session.set('orderId', orderId);

	//     Session.set('zipField', zipInput);

	//     const data = {
	// 			customer_zipcode: zipInput,
	//     };

	//     Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
	//       if ( error ) {
	//         sAlert.error( error.reason );
	//       } else {
	//       	Session.set('delivEstimate', response);
	//   			Session.set('processing', false);
	// 				Session.set('needsZip', false);
	//       	FlowRouter.go('/checkout');
	//       };
	//     });
 //    };
	// },

	'change .checkUserEmail' (event,template) {
  	const check = template.find('.checkUserEmail');
		const email = $('.userEmail').val();
    const emailCheck = $('.checkUserEmail').val();

    if (email != emailCheck) {
    	check.style.backgroundColor = 'rgba(255, 102, 102,.4)';
      $('#SignUpModalForm').find('.signUp-errors').text("Passwords must match. Please check and try again.");
    } else {
    	check.style.backgroundColor = '#eee';
      $('#SignUpModalForm').find('.signUp-errors').text("");
    };
	},

	'submit #SignUpModalForm' (event, template) {
		event.preventDefault();
    // event.stopImmediatePropagation();

    Session.set('processing', true);
    const orderReady = Session.get('pack'); // Will Change when packs become items (FIX)

		const user = {
      email: $('.userEmail').val(),
      emailCheck: $('.checkUserEmail').val(),
      password: $('.pw').val(),
      zipCode: $('.zip').val(),
    };

    if (user.email != user.emailCheck) {
      Session.set('processing', false);
      $('#SignUpModalForm').find('.signUp-errors').text("Passwords do not match. Please check and try again.");
    } else if (yesZips.indexOf(user.zipCode) < 0 ) {
      $('#SignUpModalForm').find('.signUp-errors').text("Sorry, it looks like you're outside our delivery area.");
  	} else {
      Meteor.call( 'createSubscriber', user, (error, response) => {
        if (error) {
          Session.set('loading', false);
          $('#SignUpModalForm').find('.signUp-errors').text(error.reason);
        } else {
          Meteor.loginWithPassword(user.email, user.password, (error) => {
          	if (error) {
          		sAlert.error('There was an error signing you in.')
          	} else {
							const orderToCreate = {
					    	packName: orderReady.description,
					    	packPrice: orderReady.price,
					    	packDishes: orderReady.dishes,
					    	packSnacks: orderReady.snacks
					    };

					    const orderId = insertOrder.call(orderToCreate);
					    Session.set('orderId', orderId);
			        Session.set('processing', false);
							Session.set('needsZip', false);
					    FlowRouter.go('/checkout');
          	};
          });
        };
      });
    };

		

   //  const data = {
			// customer_zipcode: user.zipCode,
   //  };

    // Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
    //   if ( error ) {
    //     sAlert.error( error.reason );
    //   } else {
    //   	Session.set('delivEstimate', response);
  			
      // };
    // });
	},
});