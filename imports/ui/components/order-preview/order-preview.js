import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';

import { getZipZone } from '/imports/api/delivery/methods.js';

import moment from 'moment';

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
	  	return Meteor.users.findOne({ _id: this.userId });
  },

  dishList() {
  	const dishList = [];
    const dishTally = {};

  	const itemList = Template.currentData().items;
  	for (var i = itemList.length - 1; i >= 0; i--) {
  		if (itemList[i].category === 'Pack') {
  			for (let j = itemList[i].sub_items.items.length - 1; j >= 0; j--) {
  				dishList.push(itemList[i].sub_items.items[j].name);
  			}
  		} else if (itemList[i].category === 'Meal') {
  			dishList.push(itemList[i].name);
  		}
  	}

    for (var i = dishList.length - 1; i >= 0; i--) {
      if (dishList[i] != '' && !dishTally[dishList[i]]) {
        dishTally[dishList[i]] = 1;
      } else if (dishList[i] != '') {
        dishTally[dishList[i]] += 1;
      }
    }

    const result = [];
    for (const key in dishTally) result.push({ name: key, value: dishTally[key] });
    return result;
  },

  snackList() {
  	const snackList = [];
    const snackTally = {};

    const itemList = Template.currentData().items;
    for (var i = itemList.length - 1; i >= 0; i--) {
  		if (itemList[i].category === 'Snack') {
  			snackList.push(itemList[i].name);
  		}
  	}

    for (var i = snackList.length - 1; i >= 0; i--) {
      if (snackList[i] != '' && !snackTally[snackList[i]]) {
        snackTally[snackList[i]] = 1;
      } else if (snackList[i] != '') {
        snackTally[snackList[i]] += 1;
      }
    }
    const result = [];
    for (const key in snackTally) result.push({ name: key, value: snackTally[key] });
    return result;
  },

  drinkList() {
  	const drinkList = [];
    const drinkTally = {};

    const itemList = Template.currentData().items;
    for (var i = itemList.length - 1; i >= 0; i--) {
  		if (itemList[i].category === 'Drink') {
  			drinkList.push(itemList[i].name);
  		}
  	}

    for (var i = drinkList.length - 1; i >= 0; i--) {
      if (drinkList[i] != '' && !drinkTally[drinkList[i]]) {
        drinkTally[drinkList[i]] = 1;
      } else if (drinkList[i] != '') {
        drinkTally[drinkList[i]] += 1;
      }
    }
    const result = [];
    for (const key in drinkTally) result.push({ name: key, value: drinkTally[key] });
    return result;
  },

  deliv_day() {
    const dw_id = Template.currentData().delivery_window_id;
    const dw = DeliveryWindows.findOne({ _id: dw_id });
    const dday = moment(dw.delivery_start_time).format('dddd');
    return dday;
  },

  deliveryZone() {
    let customer = Template.currentData().customer;
    if (!customer) {
  		customer = Meteor.users.findOne({ _id: Template.currentData().userId });
  	} // This should be an attribute of orders themselves (FIX)
  	if (customer) {
      const args = {
        zip_code: customer.address_zipcode,
      };

      const zipZone = getZipZone.call(args);
      return zipZone;
	  }
  },

  packPriceToDecimal() {
    const packPrice = (Template.currentData().packPrice / 100).toFixed(2);
    return packPrice;
  },
});
