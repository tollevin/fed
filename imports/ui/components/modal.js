import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import './modal.html';

// Zip Codes
import { yesZips } from '../../api/delivery/zipcodes.js';

import { insertOrder } from '../../api/orders/methods.js';

// Get the modal
var modal = document.getElementById('myModal');

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
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

Template.Modal.events({
	'click .close, click #myModal' (event) {
		event.preventDefault();

		Session.set('needsZip', false);
	},

	'click .modal-content' (event) {
		event.preventDefault();
    event.stopImmediatePropagation();
	},

	'keypress #zipField' (event, template) {
    if (event.which === 13) {
    	Session.set('processing', true);
	    const orderReady = Session.get('order');

			const orderToCreate = {
	    	packName: orderReady.description,
	    	packPrice: orderReady.price,
	    	packDishes: orderReady.dishes,
	    	packSnacks: orderReady.snacks
	    };

	    const zipInput = template.find('[id="zipField"]').value;
	    var modal = document.getElementById('myModal');

	    if (yesZips.indexOf(zipInput) < 0 ) {
	      modal.innerHTML = "<p class='sorry'>Sorry, it looks like you're outside our delivery area.</p>"
	    } else {
	      modal.innerHTML = "<p class='alright'>Alright!<br>Almost done.</p>"
	    };

	    const orderId = insertOrder.call(orderToCreate);
	    Session.set('orderId', orderId);

	    Session.set('zipField', zipInput);

	    const data = {
				customer_zipcode: zipInput,
	    };

	    Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
	      if ( error ) {
	        sAlert.error( error.reason );
	      } else {
	      	Session.set('delivEstimate', response);
	  			Session.set('processing', false);
					Session.set('needsZip', false);
	      	FlowRouter.go('/checkout');
	      };
	    });
    };
	},

	'click #modal-button' (event, template) {
		event.preventDefault();
    event.stopImmediatePropagation();

    Session.set('processing', true);
    const orderReady = Session.get('order');

		const orderToCreate = {
    	packName: orderReady.description,
    	packPrice: orderReady.price,
    	packDishes: orderReady.dishes,
    	packSnacks: orderReady.snacks
    };

    const zipInput = template.find('[id="zipField"]').value;
    var modal = document.getElementById('myModal');

    if (yesZips.indexOf(zipInput) < 0 ) {
      modal.innerHTML = "<p class='sorry'>Sorry, it looks like you're outside our delivery area.</p>"
			modal.style.backgroundColor = "rgba(80,34,34,0.8)";    
    } else {
      modal.innerHTML = "<p class='alright'>Alright!<br>Almost done.</p>"
			modal.style.backgroundColor = "rgba(66,127,62,0.6)";    
    };

    const orderId = insertOrder.call(orderToCreate);
    Session.set('orderId', orderId);

    Session.set('zipField', zipInput);

    const data = {
			customer_zipcode: zipInput,
    };

    Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
      if ( error ) {
        sAlert.error( error.reason );
      } else {
      	Session.set('delivEstimate', response);
  			Session.set('processing', false);
				Session.set('needsZip', false);
      	FlowRouter.go('/checkout');
      };
    });
	},
});