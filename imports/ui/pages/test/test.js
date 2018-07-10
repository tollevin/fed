import { Template } from 'meteor/templating';

import './test.html';

Template.Test.onRendered(function testPageOnRendered() {
	const stripe = Stripe('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
	const elements = stripe.elements();
	const style = {
	  base: {
	    color: '#303238',
	    fontSize: '16px',
	    lineHeight: '48px',
	    fontSmoothing: 'antialiased',
	    '::placeholder': {
	      color: '#ccc',
	    },
	  },
	  invalid: {
	    color: '#e5424d',
	    ':focus': {
	      color: '#303238',
	    },
	  },
	};

	const card = elements.create('card', {style});

	// Add an instance of the card UI component into the `card-element` <div>
	card.mount('#card-element');
});
