import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { zipZones } from '/imports/api/delivery/zipcodes.js';
import { getZipZone } from '/imports/api/delivery/methods.js';

import moment from 'moment'; 

import './subscriber-preview.html';

Template.Subscriber_preview.helpers({
  subscribedAt() {
    const subDate = new moment(Template.currentData().subscriptions.created * 1000);
    return subDate.toDate();
  },

  emailss() {
    const emails = Template.currentData().emails;
    return emails;
  },

  deliveryFee() {
    const zip = Template.currentData().address_zipcode;
    const subtotal = Template.currentData().subtotal;

    const deliveryFees = zipZones[zip].delivery_fees;

    if (subtotal > 150) { return deliveryFees.tier3; }
    return deliveryFees.tier1;
  },

  subtotal() {
    const subscriptions = Template.currentData().subscriptions;
    if (!subscriptions) { return undefined; }

    let subtotal = 0;
    for (let i = subscriptions.length - 1; i >= 0; i--) {
      subtotal += subscriptions[i].price * subscriptions[i].quantity * ((100 - subscriptions[i].percent_off) / 100);
    }

    return subtotal.toFixed(2);
  },

  sales_tax() {
    const subscriptions = Template.currentData().subscriptions;
    if (!subscriptions) { return undefined; }

    let subtotal = 0;
    for (let i = subscriptions.length - 1; i >= 0; i--) {
      subtotal += subscriptions[i].price * subscriptions[i].quantity * ((100 - subscriptions[i].percent_off) / 100);
    }

    const sales_tax = subtotal * 0.08875;

    return sales_tax.toFixed(2);
  },

  total() {
    const subscriptions = Template.currentData().subscriptions;
    if (!subscriptions) { return undefined; }

    let subtotal = 0;
    for (let i = subscriptions.length - 1; i >= 0; i--) {
      subtotal += subscriptions[i].price * subscriptions[i].quantity * ((100 - subscriptions[i].percent_off) / 100);
    }

    let total = subtotal * 1.08875;

    const zip = Template.currentData().address_zipcode;

    let delivery_fee;
    const deliveryFees = zipZones[zip].delivery_fees;

    if (subtotal > 150) {
      delivery_fee = deliveryFees.tier3;
    } else {
      delivery_fee = deliveryFees.tier1;
    }

    total += delivery_fee;

    return total.toFixed(2);
  },

  hasCredit: () => {
    const credit = Template.currentData().credit;
    return credit;
  },

  processStatus(status) {
    const currentData = Template.currentData();
    if (currentData.skipping) { return 'skipping'; }
    if (currentData.customized) { return 'customized'; }

    const subscriptions = currentData.subscriptions;
    const nextFri = moment().day(12).unix();
    const paused = (subscriptions && (subscriptions.trial_end > nextFri));

    if (paused) { return 'paused'; }

    return status;
  },

  customed() {
    const last_purchase = Template.currentData().last_purchase;
    const ready_by = last_purchase.ready_by;
    const now = new moment();
    if (now.isBefore(ready_by)) {
      const order = Meteor.Orders.findOne({ trackingCode: last_purchase.tracking_code });
      return order.packDishes;
    }
    return false;
  },

  deliveryZone() {
    const args = { zip_code: Template.currentData().address_zipcode };

    const zipZone = getZipZone.call(args);
    return zipZone;
  },

  subscription: () => Template.currentData().subscriptions && Template.currentData().subscriptions[0],

  deliv: () => (Template.currentData().preferred_deliv_windows ? Template.currentData().preferred_deliv_windows : Template.currentData().preferredDelivDay),

  allergies: () => {
    const restrictions = Template.currentData().restrictions;
    if (!restrictions) { return false; }

    const keys = Object.keys(restrictions);
    const allergies = [];

    for (let i = keys.length - 1; i >= 0; i--) {
      if (restrictions[keys[i]]) {
        allergies.push(keys[i]);
      }
    }

    return allergies;
  },
});
