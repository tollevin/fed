import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import { callWithPromise } from '/imports/ui/lib/helpers.js';

import './payment-settings.less';
import './payment-settings.html';

let stripe;
let elements;
let card;

Template.PaymentSettings.onCreated(function paymentSettingsOnCreated() {
  this.showCardElement = new ReactiveVar(false);
  this.cardElementChange = new ReactiveVar(false);
  this.userInfoChange = new ReactiveVar(false);
  this.editDefaultSource = new ReactiveVar(false);
  this.newDefault = new ReactiveVar(false);
});

Template.PaymentSettings.onRendered(function paymentSettingsOnRendered() {
  // stripe = Stripe('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
  stripe = Stripe('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');
  // Set Stripe Elements to element var
  elements = stripe.elements();
  // Create an instance of the card Element
  // Custom styling can be passed to options when creating an Element.
  const style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
    },
  };
  card = elements.create('card', { style });
});

Template.PaymentSettings.helpers({
  sources() {
    const stripeCustomer = Session.get('stripe_customer');
    return stripeCustomer ? stripeCustomer.sources : undefined;
  },

  showCardElement() {
    return Template.instance().showCardElement.get();
  },

  checkDefault(id) {
    return (id === Session.get('stripe_customer').default_source) ? 'defaultSource' : 'backupSource';
  },

  sourceType(brand) {
    const brandString = brand.replace(/\s+/g, '');
    return brandString.toLowerCase();
  },

  editDefaultMode() {
    return Template.instance().editDefaultSource.get() && 'editDefaultMode';
  },
});

async function retrieveStripeCustomer() {
  try {
    // Const the Session var of a user's Stripe user info
    const stripeId = Session.get('stripe_customer').id;
    //
    const updatedCustomer = await callWithPromise('retrieveCustomer', stripeId);
    return updatedCustomer;
  } catch (error) {
    throw new Meteor.Error(`retrieveStripeCustomer ${Meteor.userId()} ${error.message}: ${error.stack}`);
  }
}

Template.PaymentSettings.events({
  'click #addCard'(event, templateInstance) {
    templateInstance.showCardElement.set(true);

    // Add an instance of the card Element into the `card-element` <div>
    card.mount('#card-element');
  },

  'click .cancelCardInput'(event, templateInstance) {
    event.preventDefault();

    templateInstance.showCardElement.set(false);
    card.unmount();
  },

  'click .saveCardInput'(event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    async function createStripeToken() {
      try {
        const { token } = await stripe.createToken(card);
        return token;
      } catch (error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
      return undefined;
    }

    async function createNewStripeUser(token) {
      try {
        const userEmail = Meteor.user().emails[0].address;

        const cust = {
          description: `Customer for ${userEmail}`,
          source: token,
          account_balance: 0,
          email: userEmail,
        };

        return await callWithPromise('createCustomer', cust);
      } catch (error) {
        throw new Meteor.Error(error.reason);
      }
    }

    async function addStripePaymentSource(args) {
      try {
        const newSource = await callWithPromise('addPaymentSource', args);
        return newSource;
      } catch (error) {
        throw new Meteor.Error(error.reason);
      }
    }

    async function processNewPaymentSource() {
      try {
        // Make a token for the source
        const newSourceToken = await createStripeToken();
        // Make a blank args object for all arguments for Meteor.call
        const args = {};

        // If the user has Stripe userID -> a payment source logged with Stripe
        if (Meteor.user().stripe_id) {
          // use their saved stripe_id and the token_id of the new source
          // to send the info to Stripe, and save it in a constant (FIX? use of newSource?)
          args.id = Meteor.user().stripe_id;
          args.source = newSourceToken.id;
          await addStripePaymentSource(args);
        } else {
          // If the user doesn't have a Stripe userID
          // make a new Stripe user with the source token, which will become their default source
          await createNewStripeUser(newSourceToken.id);
          // FIX
        }

        const updatedCustomer = await retrieveStripeCustomer();
        Session.set('stripe_customer', updatedCustomer);
        sAlert.success('Card added!');
        templateInstance.showCardElement.set(false);
        card.unmount();
      } catch (error) {
        sAlert.error('Something went wrong. Please try again.');
        throw new Meteor.Error(error);
      }
    }

    processNewPaymentSource();
    Session.set('loading', false);
  },

  'click .change-default'(event, templateInstance) {
    templateInstance.editDefaultSource.set(true);
  },

  'click .cancel-edit-default'(event, templateInstance) {
    event.preventDefault();

    templateInstance.editDefaultSource.set(false);
  },

  'click .editDefaultMode'(event, templateInstance) {
    event.preventDefault();

    const lis = templateInstance.findAll('.editDefaultMode');
    for (let i = lis.length - 1; i >= 0; i -= 1) {
      lis[i].classList.remove('newDefault');
    }

    const li = event.currentTarget;
    const newDefault = li.id;
    templateInstance.newDefault.set(newDefault);
    li.classList.add('newDefault');
  },

  'click .save-edit-default'(event, templateInstance) {
    event.preventDefault();

    async function updateDefaultSource() {
      try {
        // Const the Session var of a user's Stripe user info
        const args = {
          id: Session.get('stripe_customer').id,
          default_source: templateInstance.newDefault.get(),
        };

        await callWithPromise('updateDefaultSource', args);
        const updatedCustomer = await retrieveStripeCustomer();
        Session.set('stripe_customer', updatedCustomer);
        sAlert.success('Settings saved');
        templateInstance.editDefaultSource.set(false);
      } catch (error) {
        throw new Meteor.Error(`updateDefaultSource ${Meteor.userId()} ${error.stack}`);
      }
    }

    updateDefaultSource();
  },
});
