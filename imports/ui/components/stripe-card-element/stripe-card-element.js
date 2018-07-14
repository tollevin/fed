import { Template } from 'meteor/templating';

import './stripe-card-element.html';

Template.Card_element.onRendered(function cardElementOnRendered() {
  // Set Stripe Public Key
  this.stripe = Stripe('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');

  // Set Stripe Elements to element var
  elements = this.stripe.elements();
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
