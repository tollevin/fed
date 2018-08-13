import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';

import {
  SETTING_SESSION, MAIN, DIET, DELIVERY, PAYMENT, REFERRAL,
} from '/imports/ui/lib/constants/settings';

import '/imports/ui/components/main-settings/main-settings.js';
import '/imports/ui/components/payment-settings/payment-settings.js';
import '/imports/ui/components/diet-settings/diet-settings.js';
import '/imports/ui/components/delivery-settings/delivery-settings.js';
import '/imports/ui/components/referral-settings/referral-settings.js';

// Components
import '/imports/ui/components/order-detail-panel/order-detail-panel.js';
import '/imports/ui/components/order-toggle/order-toggle.js';

// Template
import './user-home.less';
import './user-home.html';

const isSkipping = (user) => {
  if (!user.skipping) { return false; }

  const skippingTil = user.skipping.slice(6);
  if (moment().unix() > moment(skippingTil, 'MM-DD-YYYY').subtract(7, 'd').unix()) { return false; }

  return user.skipping;
};

Template.User_home.onCreated(function userHomeOnCreated() {
  Session.set(SETTING_SESSION, MAIN);

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

Template.User_home.helpers({
  forward: () => Session.get(SETTING_SESSION) !== MAIN,
  settingsMenu: () => Session.get(SETTING_SESSION) === MAIN,
  diet: () => Session.get(SETTING_SESSION) === DIET,
  delivery: () => Session.get(SETTING_SESSION) === DELIVERY,
  referral: () => Session.get(SETTING_SESSION) === REFERRAL,
  payment: () => Session.get(SETTING_SESSION) === PAYMENT,
});

Template.User_home.events({
  'click #Sub' (event) {
    event.preventDefault();
    FlowRouter.go('/subscribe');
  },

  'click #diet-settings'(event) {
    event.preventDefault();
    Session.set(SETTING_SESSION, DIET);
  },

  'click #manage-subscriptions'(event) {
    event.preventDefault();
    Session.set(SETTING_SESSION, DELIVERY);
  },

  'click #payment-settings'(event) {
    event.preventDefault();
    Session.set(SETTING_SESSION, PAYMENT);
  },

  'click #referral-settings'(event) {
    event.preventDefault();
    Session.set(SETTING_SESSION, REFERRAL);
  },

  'click #Back'(event) {
    event.preventDefault();
    Session.set(SETTING_SESSION, MAIN);
  },
});
