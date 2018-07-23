import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

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
    return Session.get('stripe_customer').sources;
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

Template.PaymentSettings.events({
  'click #addCard'(event, template) {
    template.showCardElement.set(true);

    // Add an instance of the card Element into the `card-element` <div>
    card.mount('#card-element');
  },

  'change [name="cardnumber"]'(event, template) {
    console.log(event);
  },

  'click .cancelCardInput'(event, template) {
    event.preventDefault();

    template.showCardElement.set(false);
    card.unmount();
  },

  'click .saveCardInput'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    async function createStripeToken() {
      try {
        const { token, error } = await stripe.createToken(card);
        return token;
      } catch (error) {
        // Inform the customer that there was an error
        console.log(error);
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
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

        const stripe_id = await callWithPromise('createCustomer', cust);

        return stripe_id;
      } catch (error) {
        throw new Meteor.Error(error.reason);
      }
    }

    async function addStripePaymentSource(args) {
      try {
        const newSource = await callWithPromise('addPaymentSource', args);
        return newSource;
      } catch (error) {
        console.log(error.reason);
        throw new Meteor.Error(error.reason);
      }
    }

    async function retrieveStripeCustomer() {
      try {
        // Const the Session var of a user's Stripe user info
        const stripe_id = Session.get('stripe_customer').id;
        //
        const updatedCustomer = await callWithPromise('retrieveCustomer', stripe_id);
        return updatedCustomer;
      } catch (error) {
        throw new Meteor.Error(`retrieveStripeCustomer ${Meteor.userId()} ${error.reason}`);
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
          const newSource = await addStripePaymentSource(args);
        // If the user doesn't have a Stripe userID
        } else {
          // make a new Stripe user with the source token, which will become their default source
          const newUser = await createNewStripeUser(newSourceToken.id);
          // FIX
        }

        const updatedCustomer = await retrieveStripeCustomer();
        Session.set('stripe_customer', updatedCustomer);
        sAlert.success('Card added!');
        template.showCardElement.set(false);
        card.unmount();
      } catch (error) {
        sAlert.error('Something went wrong. Please try again.');
        throw new Meteor.Error(error);
      }
    }

    processNewPaymentSource();
    Session.set('loading', false);
  },

  'click .change-default'(event, template) {
    template.editDefaultSource.set(true);
  },

  'click .cancel-edit-default'(event, template) {
    event.preventDefault();

    template.editDefaultSource.set(false);
  },

  'click .editDefaultMode'(event, template) {
    event.preventDefault();

    const lis = template.findAll('.editDefaultMode');
    for (let i = lis.length - 1; i >= 0; i--) {
      lis[i].classList.remove('newDefault');
    }

    const li = event.currentTarget;
    const newDefault = li.id;
    template.newDefault.set(newDefault);
    li.classList.add('newDefault');
  },

  'click .save-edit-default'(event, template) {
    event.preventDefault();

    async function retrieveStripeCustomer() {
      try {
        // Const the Session var of a user's Stripe user info
        const stripe_id = Session.get('stripe_customer').id;
        //
        const updatedCustomer = await callWithPromise('retrieveCustomer', stripe_id);
        return updatedCustomer;
      } catch (error) {
        throw new Meteor.Error(`retrieveStripeCustomer ${Meteor.userId()} ${error.reason}`);
      }
    }

    async function updateDefaultSource() {
      try {
        // Const the Session var of a user's Stripe user info
        const args = {
          id: Session.get('stripe_customer').id,
          default_source: template.newDefault.get(),
        };

        const updatedSource = await callWithPromise('updateDefaultSource', args);
        const updatedCustomer = await retrieveStripeCustomer();
        Session.set('stripe_customer', updatedCustomer);
        sAlert.success('Settings saved');
        template.editDefaultSource.set(false);
      } catch (error) {
        throw new Meteor.Error(`updateDefaultSource ${Meteor.userId()} ${error}`);
      }
    }

    const resetListItemStyle = () => {
      const li = template.find('.newDefault');
      li.classList.remove('newDefault');
    };

    updateDefaultSource();
  },
});
