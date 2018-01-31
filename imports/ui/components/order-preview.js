import './order-preview.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Orders } from '../../api/orders/orders.js';
import { Promos } from '../../api/promos/promos.js';

import { 
  MH,
  MH_20
} from '../../api/delivery/zipcodes.js';

import {
	getZipZone
} from '../../api/delivery/methods.js';

Template.Order_preview.onCreated(function orderPreviewOnCreated() {
  this.autorun(() => {
    var orderSub = this.subscribe('single.order', this._id);
    var userSub = this.subscribe('thisUserData', this.userId);
  });
});

Template.Order_preview.helpers({
  user() {
  	if (this.customer) {
  		return this.customer;
  	} else {
	  	return Meteor.users.findOne({_id: this.userId});
	  };
  },

  dishList() {
  	var dishList = Template.currentData().packDishes;
		var dishTally = {};
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
  	var snackList = Template.currentData().packSnacks;
		var snackTally = {};
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

	delivFee() {
		var customer = Template.currentData().customer;
  	if (!customer) {
  		customer = Meteor.users.findOne({_id: this.userId});
  	}; // This should be an attribute of orders themselves (FIX)
		if (customer) {
			var zip = customer.address_zipcode;
			if (MH.indexOf(zip) > -1) {
	      return 13;
	    } else if (MH_20.indexOf(zip) > -1) {
	      return 20;
	    } else {
	    	return 0;
	    };
	  };
	},

	saleAmount() {
		const salePrice = Template.currentData().salePrice;
		const salePriceMinusTax = salePrice * .91125;
		return salePriceMinusTax.toFixed(2);
	},

	taxAmount() {
		const salePrice = Template.currentData().salePrice;
		const taxAmount = (salePrice * .08875);
		return taxAmount.toFixed(2);
	},

	total() {
		const salePrice = Template.currentData().salePrice;
    return (salePrice * 1.08875).toFixed(2);
	},

	packPriceToDecimal() {
		var packPrice = (Template.currentData().packPrice/100).toFixed(2);
		return packPrice;
	},
});