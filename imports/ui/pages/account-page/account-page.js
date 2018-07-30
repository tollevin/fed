import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import '/imports/ui/components/main-settings/main-settings.js';
import '/imports/ui/components/payment-settings/payment-settings.js';
import '/imports/ui/components/diet-settings/diet-settings.js';
import '/imports/ui/components/delivery-settings/delivery-settings.js';

import './account-page.less';
import './account-page.html';

const isSkipping = (user) => {
  if (!user.skipping) { return false; }

  const skippingTil = user.skipping.slice(6);
  if (moment().unix() > moment(skippingTil, 'MM-DD-YYYY').subtract(7, 'd').unix()) { return false; }

  return user.skipping;
};

Template.Account_page.onCreated(function accountPageOnCreated() {
  Session.set('stage', 0);

  this.autorun(() => {
    const subs = this.subscribe('thisUserData');

    if (!Meteor.userId()) {
      FlowRouter.go('/signin');
      return;
    }

    if (!subs.ready()) { return; }

    const { stripe_id: stripeId } = Meteor.user();
    // If user has a stripe_id, retrieve their customer info from Stripe
    if (!stripeId) { return; }

    Meteor.call('retrieveCustomer', stripeId, (err, response) => {
      if (err) { return; }
      // Set stripe_customer info to a Session var
      Session.setDefault('stripe_customer', response);
      // Figure out if a user is currently skipping (REDUNDANT post cron)

      const user = Meteor.user();
      user.skipping = isSkipping(user);
      Session.setDefault('skipping', user.skipping);
      // If user's subscription start matches the start of their current billing period,
      // set them as 'trialing' (new customer)
      const { created, current_period_start: currentPeriodStart } = response.subscriptions.data;
      if (created === currentPeriodStart) { Session.set('trial', true); }
    });
  });

  Session.set('cartOpen', false);
});

Template.Account_page.helpers({
  forward: () => !(Session.get('stage') === 0),
  settingsMenu: () => Session.get('stage') === 0,
  diet: () => Session.get('stage') === 1,
  delivery: () => Session.get('stage') === 2,
  payment: () => Session.get('stage') === 3,
  unsub: () => Session.get('stage') === 5,
});

Template.Account_page.events({
  'click #Sub' (event) {
    event.preventDefault();
    FlowRouter.go('/subscribe');
  },

  'click #diet-settings'(event) {
    event.preventDefault();
    Session.set('stage', 1);
  },

  'click #manage-subscriptions'(event) {
    event.preventDefault();
    Session.set('stage', 2);
  },

  'click #payment-settings'(event) {
    event.preventDefault();
    Session.set('stage', 3);
  },

  'click #Back'(event) {
    event.preventDefault();
    Session.set('stage', 0);
  },


  'click #Unsub'(event) {
    event.preventDefault();
    Session.set('stage', 5);
  },

  'click #Unsubscribe'(event) {
    event.preventDefault();

    const subscriptionId = Meteor.user().subscriptions.id;

    Meteor.call('cancelSubscription', subscriptionId, (error, response) => {
      if (error) { return; }
      const user = Meteor.user();
      user.subscriptions = response;

      Meteor.call('updateUser', Meteor.userId(), user);
      sAlert.success('You have been unsubscribed. We hope to see you again soon!');
      FlowRouter.go('/');
    });
  },
});
