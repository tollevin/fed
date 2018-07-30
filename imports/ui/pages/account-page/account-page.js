import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import '/imports/ui/components/payment-settings/payment-settings.js';
import '/imports/ui/components/diet-settings/diet-settings.js';

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
  subscribed: () => Meteor.user().subscriptions && Meteor.user().subscriptions.status !== 'canceled', // FIX!!!!
  first_name: () => Meteor.user().first_name,
  last_name: () => Meteor.user().last_name,
  phone: () => Meteor.user().phone,
  email: () => Meteor.user().emails[0].address,
  address1: () => Meteor.user().address_line_1,
  address2: () => Meteor.user().address_line_2,
  city: () => Meteor.user().address_city,
  zip: () => Meteor.user().address_zipcode,
  comments: () => Meteor.user().deliv_comments,
  cardNo: () => `************${Session.get('stripe_customer').sources.data[0].last4}`,
  nextDeliv() {
    const user = Meteor.user();
    if (!user) { return undefined; }

    const { preferredDelivDay, subscription } = user;
    if (!subscription) { return undefined; }

    const { status: subscriptionStatus, trial_end: trialEnd } = subscription;

    if (subscriptionStatus === 'trialing') {
      const toAdd = (preferredDelivDay === 'sunday') ? 3 : 4;
      const nextDelivTime = (trialEnd * 1000) + (toAdd * 24 * 60 * 60 * 1000);
      const nextDeliv = new Date(nextDelivTime).toLocaleDateString();
      return `${preferredDelivDay.charAt(0).toUpperCase() + preferredDelivDay.slice(1)}, ${nextDeliv}`;
    }

    if (subscriptionStatus === 'active') {
      const dy = (preferredDelivDay === 'sunday') ? 0 : 1;
      const now = new moment();

      return now.day(dy + 7).format('dddd, M/D/YY');
    }
    return undefined;
  },
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

  'submit #DeliveryForm'(event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    const formdata = {};
    if (templateInstance.find('[name="customer.firstName"]').value) formdata.first_name = templateInstance.find('[name="customer.firstName"]').value;
    if (templateInstance.find('[name="customer.lastName"]').value) formdata.last_name = templateInstance.find('[name="customer.lastName"]').value;
    if (templateInstance.find('[name="customer.phone"]').value) formdata.phone = templateInstance.find('[name="customer.phone"]').value;
    if (templateInstance.find('[name="customer.email"]').value) formdata.email = templateInstance.find('[name="customer.email"]').value;
    if (templateInstance.find('[name="customer.address.line1"]').value) formdata.address_line_1 = templateInstance.find('[name="customer.address.line1"]').value;
    if (templateInstance.find('[name="customer.address.line2"]').value) formdata.address_line_2 = templateInstance.find('[name="customer.address.line2"]').value;
    if (templateInstance.find('[name="customer.address.city"]').value) formdata.address_city = templateInstance.find('[name="customer.address.city"]').value;
    if (templateInstance.find('[name="customer.address.state"]').value) formdata.address_state = templateInstance.find('[name="customer.address.state"]').value;
    if (templateInstance.find('[name="customer.address.zipCode"]').value) formdata.address_zipcode = templateInstance.find('[name="customer.address.zipCode"]').value;
    if (templateInstance.find('[name="destinationComments"]').value) formdata.comments = templateInstance.find('[name="destinationComments"]').value;

    Meteor.call('updateUser', Meteor.userId(), formdata, (error) => {
      if (error) { return; }
      sAlert.success('Delivery settings updated!');
      Session.set('stage', 0);
    });
    Session.set('loading', false);
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
