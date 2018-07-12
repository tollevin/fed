import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { callWithPromise } from '/imports/ui/lib/helpers.js';
import { yesZips } from '/imports/api/delivery/zipcodes.js';

import '/imports/ui/components/stripe-card-element/stripe-card-element.js';

import './gift-cards.less';
import './gift-cards.html';

Template.Gift_Cards.onCreated(function giftCardsOnCreated() {
  this.order = new ReactiveVar(false);
  this.stripe_id = new ReactiveVar(false);
  // this.paymentRequest = new ReactiveVar();

  this.autorun(() => {
    const subs = this.subscribe('thisUserData');

    if (subs.ready()) {
      if (Meteor.userId()) this.stripe_id.set(Meteor.user().stripe_id);
    }
  });
});

Template.Gift_Cards.onRendered(function giftCardsOnRendered() {
});

Template.Gift_Cards.helpers({
  loading() {
    return Session.get('loading');
  },

  stripeId() {
    return Template.instance().stripe_id.get();
  },

  disabled() {
    return Session.get('loading') && 'disabled';
  },

  price() {
    const order = Template.instance().order.get();
    return order && (order.price / 100).toFixed(2);
  },
  salePrice() {
    const order = Template.instance().order.get();
    return order && (order.price / 100).toFixed(2); // Add built-in discount here.
  },
});

Template.Gift_Cards.events({
  'click .amount-button'(event, template) {
    event.preventDefault();
    const allValues = template.findAll('.amount-button');
    for (let i = allValues.length - 1; i >= 0; i--) {
      allValues[i].classList.remove('active');
    }
    const customAmountElement = document.getElementById('custom-amount');
    customAmountElement.value = null;
    event.currentTarget.classList.add('active');

    const value = parseInt(event.currentTarget.id) * 100;
    const item = {
      type: 'giftCard',
      description: `Fed $${event.currentTarget.id} Gift Card`,
      price: value,
    };

    template.order.set(item);
  },

  'click #custom-amount, change #custom-amount'(event, template) {
    const allValues = template.findAll('.amount-button');
    for (let i = allValues.length - 1; i >= 0; i--) {
      allValues[i].classList.remove('active');
    }

    event.currentTarget.classList.add('active');
    const value = event.currentTarget.value;
    if (parseFloat(value) < 0) {
      event.currentTarget.value = 0;
    } else if (value != '') {
      const valueInCents = parseFloat(value) * 100;
      const item = {
        type: 'giftCard',
        description: `Fed $${event.currentTarget.id} Gift Card`,
        price: valueInCents,
      };

      template.order.set(item);
    }
  },

  'blur #custom-amount'(event, template) {
    const value = event.currentTarget.value;
    if (value === '') {
      event.currentTarget.classList.remove('active');
    } else {
      const valueInCents = parseFloat(value) * 100;
      const item = {
        type: 'giftCard',
        description: `Fed $${event.currentTarget.id} Gift Card`,
        price: valueInCents,
      };

      template.order.set(item);
    }
  },

  'blur #zipcode'(event, template) {
    const value = event.currentTarget.value;
    if (yesZips.indexOf(value) < 0) {
      const errorElement = document.getElementById('zip-errors');
      errorElement.textContent = 'Sorry, but we only deliver to Brooklyn, Queens, and Manhattan at this time.';
    }
  },

  'submit #Gift-Card-Form'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    function checkZipInRange() {
      const zipValue = document.getElementById('zipcode').value;
      const zipInRange = yesZips.indexOf(zipValue) > -1;
      if (!zipInRange) {
        const errorElement = document.getElementById('zip-errors');
        errorElement.textContent = 'Sorry, but we only deliver to Brooklyn, Queens, and Manhattan at this time.';
        throw new Meteor.Error(412, 'Zip code out of range');
      }
      return zipInRange;
    }

    async function checkGiftCardValue() {
      try {
        const giftCardValue = template.find('.active').value;
        return parseInt(giftCardValue) * 100;
      } catch (error) {
        const errorElement = document.getElementById('gift-button-errors');
        errorElement.textContent = 'Please choose a gift card value';
        Session.set('loading', false);
      }
    }

    async function createStripeToken() {
      try {
        const childView = Blaze.getView(template.find('#card-element'));
        const childTemplateInstance = childView._templateInstance;
        const card = childTemplateInstance.card;
        const stripe = childTemplateInstance.stripe;
        const { token, error } = await stripe.createToken(card);
        return token;
      } catch (error) {
        // Inform the customer that there was an error
        console.log(error);
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
    }

    async function createStripeCustomer(cust) {
      try {
        const newStripeCustomer = await callWithPromise('createCustomer', cust);
        return newStripeCustomer;
      } catch (error) {
        console.log(error);
        throw new Meteor.Error(411, 'Something went wrong with Stripe. Please try again');
      }
    }

    async function chargeStripe(charge) {
      try {
        const newCharge = await callWithPromise('processPayment', charge);
        return newCharge;
      } catch (error) {
        sAlert.error(error.reason);
        throw new Meteor.Error(401, 'Something went wrong with Stripe. Please try again');
      }
    }

    async function processGiftCardOrder() {
      try {
        const zipInRange = checkZipInRange();
        const giftCardValue = await checkGiftCardValue();
        const giftCardPrice = giftCardValue; // Add discount here
        const customer = {};
        customer.first_name = template.find('[name="customer.first_name"]').value;
        customer.last_name = template.find('[name="customer.last_name"]').value;
        customer.email = template.find('[name="customer.email"]').value;
        const recipient = {};
        recipient.first_name = template.find('[name="recipient.first_name"]').value;
        recipient.last_name = template.find('[name="recipient.last_name"]').value;
        recipient.email = template.find('[name="recipient.email"]').value;
        recipient.address_zipcode = template.find('[name="recipient.address_zipcode"]').value;
        const message = template.find('[name="message"]').value;
        let stripe_id = false;

        if (Meteor.userId() && Meteor.user().stripe_id) {
          stripe_id = Meteor.user().stripe_id;
        } else {
          const token = await createStripeToken();
          const newCustomer = {
            description: `Guest Customer for ${customer.first_name} ${customer.last_name}`,
            source: token.id,
            account_balance: 0,
            email: customer.email,
          };

          const newStripeCustomer = await createStripeCustomer(newCustomer);
          stripe_id = newStripeCustomer.id;
          if (Meteor.userId()) {
            // Update the Meteor.user() with the stripe_id
          }
        }

        const charge = {
          amount: giftCardPrice,
          currency: 'usd',
          customer: stripe_id,
          description: `Fed $${(giftCardValue / 100).toFixed(2)} Gift Card`,
          receipt_email: customer.email,
        };

        const newCharge = await chargeStripe(charge);

        // Give customer, recipient, and charge info to email
        const giftOrder = {
          customer,
          recipient,
          message,
          charge: newCharge,
          value: giftCardValue,
          status: 'paid',
        };

        Session.set('giftOrder', giftOrder);
        Session.set('loading', false);
        FlowRouter.go('/success');
      } catch (error) {
        sAlert.error(error.reason);
        Session.set('loading', false);
        throw new Meteor.Error(401, 'Something went wrong. Please try again');
      }
    }

    processGiftCardOrder();
  },
});
