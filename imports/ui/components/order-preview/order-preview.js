import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';

import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

import { getZipZone } from '/imports/api/delivery/methods.js';

import './order-preview.html';

Template.Order_preview.onCreated(function orderPreviewOnCreated() {
  this.subscribe('DeliveryWindows.single', this.data.delivery_window_id);
  this.subscribe('single.order', this.data._id);
  this.subscribe('thisUserData', this.user_id);
});

Template.Order_preview.helpers({
  user() {
    if (this.recipient) {
      return this.recipient;
    }
    return Meteor.users.findOne({ _id: this.user_id });
  },

  dishList() {
    const dishList = [];
    const dishTally = {};

    const itemList = Template.currentData().items;
    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (itemList[i].category === 'Pack') {
        for (let j = itemList[i].sub_items.items.length - 1; j >= 0; j -= 1) {
          dishList.push(itemList[i].sub_items.items[j].name);
        }
      } else if (itemList[i].category === 'Meal') {
        dishList.push(itemList[i].name);
      }
    }

    for (let i = dishList.length - 1; i >= 0; i -= 1) {
      if (dishList[i] !== '' && !dishTally[dishList[i]]) {
        dishTally[dishList[i]] = 1;
      } else if (dishList[i] !== '') {
        dishTally[dishList[i]] += 1;
      }
    }

    return Object.entries(dishTally).map(([name, value]) => ({ name, value }));
  },

  plateList() {
    const plateList = [];
    const plateTally = {};

    const itemList = Template.currentData().items;
    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (itemList[i].category === 'Plate') {
        plateList.push(itemList[i].name);
      }
    }

    for (let i = plateList.length - 1; i >= 0; i -= 1) {
      if (plateList[i] !== '' && !plateTally[plateList[i]]) {
        plateTally[plateList[i]] = 1;
      } else if (plateList[i] !== '') {
        plateTally[plateList[i]] += 1;
      }
    }
    return Object.entries(plateTally).map(([name, value]) => ({ name, value }));
  },

  snackList() {
    const snackList = [];
    const snackTally = {};

    const itemList = Template.currentData().items;
    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (itemList[i].category === 'Snack') {
        snackList.push(itemList[i].name);
      }
    }

    for (let i = snackList.length - 1; i >= 0; i -= 1) {
      if (snackList[i] !== '' && !snackTally[snackList[i]]) {
        snackTally[snackList[i]] = 1;
      } else if (snackList[i] !== '') {
        snackTally[snackList[i]] += 1;
      }
    }
    return Object.entries(snackTally).map(([name, value]) => ({ name, value }));
  },

  drinkList() {
    const drinkList = [];
    const drinkTally = {};

    const itemList = Template.currentData().items;
    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (itemList[i].category === 'Drink') {
        drinkList.push(itemList[i].name);
      }
    }

    for (let i = drinkList.length - 1; i >= 0; i -= 1) {
      if (drinkList[i] !== '' && !drinkTally[drinkList[i]]) {
        drinkTally[drinkList[i]] = 1;
      } else if (drinkList[i] !== '') {
        drinkTally[drinkList[i]] += 1;
      }
    }
    return Object.entries(drinkTally).map(([name, value]) => ({ name, value }));
  },

  deliv_day() {
    const dwId = Template.currentData().delivery_window_id;
    const dw = DeliveryWindows.findOne({ _id: dwId });
    if (!dw) { return 'no delivery window specified'; }
    const dday = moment(dw.delivery_start_time).format('ddd M/D/YY');
    return dday;
  },

  deliveryZone() {
    let { customer } = Template.currentData();
    if (!customer) {
      customer = Meteor.users.findOne({ _id: Template.currentData().userId });
      return undefined;
    } // This should be an attribute of orders themselves (FIX)
    const args = {
      zip_code: customer.address_zipcode,
    };

    const zipZone = getZipZone.call(args); // This can be undefined ZIPFAIL
    return zipZone;
  },

  packPriceToDecimal() {
    const packPrice = (Template.currentData().packPrice / 100).toFixed(2);
    return packPrice;
  },

  completeAfter() {
    const dwId = Template.currentData().delivery_window_id;
    const dw = DeliveryWindows.findOne({ _id: dwId });
    if (!dw) { return 'no delivery window specified'; }
    const cA = moment(dw.delivery_start_time).format('M/D/YYYY h:mm a');
    return cA;
  },

  completeBefore() {
    const dwId = Template.currentData().delivery_window_id;
    const dw = DeliveryWindows.findOne({ _id: dwId });
    if (!dw) { return 'no delivery window specified'; }
    const cB = moment(dw.delivery_end_time).format('M/D/YYYY h:mm a');
    return cB;
  },

  restrictions: () => {
    const { restrictions } = Meteor.users.findOne({ _id: Template.currentData().user_id });
    return restrictions;
  },
});
