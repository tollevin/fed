import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Orders } from '/imports/api/orders/orders.js';
import { Promos } from '/imports/api/promos/promos.js';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';

import { MH, MH_20 } from '/imports/api/delivery/zipcodes.js';
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
  	} else {
	  	return Meteor.users.findOne({_id: this.userId});
	  };
  },

  dishList() {
  	var dishList = [];
		var dishTally = {};

  	var itemList = Template.currentData().items;
  	for (var i = itemList.length - 1; i >= 0; i--) {
  		if (itemList[i].category === 'Pack') {
  			for (var j = itemList[i].sub_items.items.length - 1; j >= 0; j--) {
  				dishList.push(itemList[i].sub_items.items[j].name);
  			}
  		} else if (itemList[i].category === 'Meal'){
  			dishList.push(itemList[i].name);
  		};
  	};

		for (var i = dishList.length - 1; i >= 0; i--) {
			if (dishList[i] != '' && !dishTally[dishList[i]]) {
				dishTally[dishList[i]] = 1;
			} else if (dishList[i] != '') {
				dishTally[dishList[i]] += 1;
			};
		};

		var result = [];
    for (var key in dishTally) result.push({name:key,value:dishTally[key]});
    return result;
  },

  snackList() {
  	var snackList = [];
		var snackTally = {};

		var itemList = Template.currentData().items;
		for (var i = itemList.length - 1; i >= 0; i--) {
  		if (itemList[i].category === 'Snack') {
  			snackList.push(itemList[i].name);
  		};
  	};

		for (var i = snackList.length - 1; i >= 0; i--) {
			if (snackList[i] != '' && !snackTally[snackList[i]]) {
				snackTally[snackList[i]] = 1;
			} else if (snackList[i] != '') {
				snackTally[snackList[i]] += 1;
			};
		};
		var result = [];
    for (var key in snackTally) result.push({name:key,value:snackTally[key]});
    return result;
	},

	drinkList() {
  	var drinkList = [];
		var drinkTally = {};

		var itemList = Template.currentData().items;
		for (var i = itemList.length - 1; i >= 0; i--) {
  		if (itemList[i].category === 'Drink') {
  			drinkList.push(itemList[i].name);
  		};
  	};

		for (var i = drinkList.length - 1; i >= 0; i--) {
			if (drinkList[i] != '' && !drinkTally[drinkList[i]]) {
				drinkTally[drinkList[i]] = 1;
			} else if (drinkList[i] != '') {
				drinkTally[drinkList[i]] += 1;
			};
		};
		var result = [];
    for (var key in drinkTally) result.push({name:key,value:drinkTally[key]});
    return result;
	},

	deliv_day() {
		var dw_id = Template.currentData().delivery_window_id;
		const dw = DeliveryWindows.findOne({_id: dw_id});
		const dday = moment(dw.delivery_start_time).format('dddd');
		return dday
	},

	deliveryZone() {
		var customer = Template.currentData().customer;
		if (!customer) {
  		customer = Meteor.users.findOne({_id: Template.currentData().userId});
  	}; // This should be an attribute of orders themselves (FIX)
  	if (customer) {
			var args = {
				zip_code: customer.address_zipcode
			};

			var zipZone = getZipZone.call(args);
			return zipZone;
	  };
	},

	packPriceToDecimal() {
		var packPrice = (Template.currentData().packPrice/100).toFixed(2);
		return packPrice;
	},
});