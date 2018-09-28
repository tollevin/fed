import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';

import { zipZones } from '/imports/api/delivery/zipcodes.js';
import { getZipZone } from '/imports/api/delivery/methods.js';

import './subscriber-preview.html';

Template.Subscriber_preview.helpers({
  subscribedAt() {
    const subDate = new moment(Template.currentData().subscriptions.created * 1000);
    return subDate.toDate();
  },

  emailss() {
    const { emails } = Template.currentData();
    return emails;
  },

  deliveryFee() {
    const zip = Template.currentData().address_zipcode;
    const { subtotal } = Template.currentData();

    const foundZip = zipZones[zip];

    if (foundZip) { return 10; } // if zip is not found delivery fee is 10
    const deliveryFees = foundZip.delivery_fees;

    if (subtotal > 150) { return deliveryFees.tier3; }
    return deliveryFees.tier1;
  },

  subtotal() {
    const { subscriptions } = Template.currentData();
    if (!subscriptions) { return undefined; }

    let subtotal = 0;
    for (let i = subscriptions.length - 1; i >= 0; i -= 1) {
      subtotal += (
        subscriptions[i].price
        * subscriptions[i].quantity
        * ((100 - subscriptions[i].percent_off) / 100));
    }

    return subtotal.toFixed(2);
  },

  sales_tax() {
    const { subscriptions } = Template.currentData();
    if (!subscriptions) { return undefined; }

    let subtotal = 0;
    for (let i = subscriptions.length - 1; i >= 0; i -= 1) {
      subtotal += (
        subscriptions[i].price
        * subscriptions[i].quantity
        * ((100 - subscriptions[i].percent_off) / 100));
    }

    const salesTax = subtotal * 0.08875;

    return salesTax.toFixed(2);
  },

  total() {
    const { subscriptions } = Template.currentData();
    if (!subscriptions) { return undefined; }

    let subtotal = 0;
    for (let i = subscriptions.length - 1; i >= 0; i -= 1) {
      subtotal
        += (subscriptions[i].price
          * subscriptions[i].quantity
          * ((100 - subscriptions[i].percent_off) / 100));
    }

    let total = subtotal * 1.08875;

    const zip = Template.currentData().address_zipcode;

    const deliveryFees = zipZones[zip].delivery_fees;
    const deliveryFee = (subtotal > 150) ? deliveryFees.tier3 : deliveryFees.tier1;

    total += deliveryFee;

    return total.toFixed(2);
  },

  hasCredit: () => {
    const { credit } = Template.currentData();
    return credit;
  },

  processStatus(status) {
    const currentData = Template.currentData();
    if (currentData.skipping) { return 'skipping'; }
    if (currentData.customized) { return 'customized'; }

    const { subscriptions } = currentData;
    const nextFri = moment().day(12).unix();
    const paused = (subscriptions && (subscriptions.trial_end > nextFri));

    if (paused) { return 'paused'; }

    return status;
  },

  customed() {
    const { last_purchase: lastPurchase } = Template.currentData();
    const { ready_by: readyBy } = lastPurchase;
    const now = new moment();
    if (now.isBefore(readyBy)) {
      const order = Meteor.Orders.findOne({ trackingCode: lastPurchase.tracking_code });
      return order.packDishes;
    }
    return false;
  },

  deliveryZone() {
    const args = { zip_code: Template.currentData().address_zipcode };
    return getZipZone.call(args);
  },

  subscription: () => Template.currentData().subscriptions
    && Template.currentData().subscriptions[0],

  deliv: () => (
    Template.currentData().preferred_deliv_windows
      ? Template.currentData().preferred_deliv_windows
      : Template.currentData().preferredDelivDay
  ),

  allergies: () => {
    const { restrictions } = Template.currentData();
    if (!restrictions) { return false; }

    const keys = Object.keys(restrictions);
    const allergies = [];

    for (let i = keys.length - 1; i >= 0; i -= 1) {
      if (restrictions[keys[i]]) {
        allergies.push(keys[i]);
      }
    }

    return allergies;
  },
});
