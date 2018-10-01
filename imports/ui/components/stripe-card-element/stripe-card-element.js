import { Template } from 'meteor/templating';

import './stripe-card-element.html';

Template.Card_element.onRendered(function cardElementOnRendered() {
  // Set Stripe Public Key
  // TODO Dangerous!!!

  const stripeString = window.location.hostname === 'localhost'
    ? 'pk_test_ZWJ6mVy3TVMayrfp42HnHOMN'
    : 'pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd';

  this.stripe = Stripe(stripeString);

  // Set Stripe Elements to element var
  const elements = this.stripe.elements();
  // Create an instance of the card Element
  // Custom styling can be passed to options when creating an Element.
  const style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
    },
  };
  this.card = elements.create('card', { style });
  this.card.mount('#card-element');
});
