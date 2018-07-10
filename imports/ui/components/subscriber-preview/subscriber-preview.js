import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { zipZones } from '/imports/api/delivery/zipcodes.js';
import { getZipZone } from '/imports/api/delivery/methods.js';

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

		let delivery_fee;
    const deliveryFees = zipZones[zip].delivery_fees;
      
    if (subtotal > 150) {
      delivery_fee = deliveryFees.tier3;
    } else {
      delivery_fee = deliveryFees.tier1;
    };

    return delivery_fee;
	},

	subtotal() {
		if (Template.currentData().subscriptions) {
			const subscriptions = Template.currentData().subscriptions;
			var subtotal = 0;
			for (var i = subscriptions.length - 1; i >= 0; i--) {
				subtotal += subscriptions[i].price * subscriptions[i].quantity * ((100 - subscriptions[i].percent_off) / 100);
			};

			return subtotal.toFixed(2);
		};
	},

	sales_tax() {
		if (Template.currentData().subscriptions) {
			const subscriptions = Template.currentData().subscriptions;
			var subtotal = 0;
			for (var i = subscriptions.length - 1; i >= 0; i--) {
				subtotal += subscriptions[i].price * subscriptions[i].quantity * ((100 - subscriptions[i].percent_off) / 100);
			};

			const sales_tax = subtotal * .08875;

			return sales_tax.toFixed(2);
		};
	},

	total() {
		if (Template.currentData().subscriptions) {
			const subscriptions = Template.currentData().subscriptions;
			var subtotal = 0;
			for (var i = subscriptions.length - 1; i >= 0; i--) {
				subtotal += subscriptions[i].price * subscriptions[i].quantity * ((100 - subscriptions[i].percent_off) / 100);
			};

			var total = subtotal * 1.08875;

			const zip = Template.currentData().address_zipcode;

			let delivery_fee;
	    const deliveryFees = zipZones[zip].delivery_fees;
	      
	    if (subtotal > 150) {
	      delivery_fee = deliveryFees.tier3;
	    } else {
	      delivery_fee = deliveryFees.tier1;
	    };

	    total += delivery_fee;

	    return total.toFixed(2);
	  };
	},

	hasCredit: ()=> {
		const credit = Template.currentData().credit;
		return credit;
	},

	processStatus(status) {
		const skipping = Template.currentData().skipping;
		// const now = moment().unix();
		const nextFri = moment().day(12).unix();

		const customized = Template.currentData().customized;

		let paused;
		if (Template.currentData().subscriptions && (Template.currentData().subscriptions.trial_end > nextFri)) {
			paused = true;
		} else {
			paused = false;
		};
		
		if (skipping) {
			return "skipping";
		} else if (customized) {
			return "customized";
		} else if (paused) {
			return "paused";
		} else {
			return status;
		};
	},

	customed() {
		const last_purchase = Template.currentData().last_purchase;
		const ready_by = last_purchase.ready_by;
		const now = new moment();
		if (now.isBefore(ready_by)) {
			var order = Meteor.Orders.findOne({trackingCode: last_purchase.tracking_code});
			return order.packDishes;
		} else {
			return false;
		};
	},

	deliveryZone() {
		var args = {
			zip_code: Template.currentData().address_zipcode
		};

		var zipZone = getZipZone.call(args);
		return zipZone;
	},

	subscription: () => {
		return Template.currentData().subscriptions && Template.currentData().subscriptions[0];
	},

	deliv: ()=> {
		return Template.currentData().preferred_deliv_windows ? Template.currentData().preferred_deliv_windows : Template.currentData().preferredDelivDay;
	},

	allergies: ()=> {
		const restrictions = Template.currentData().restrictions;
		if (restrictions) {
			const keys = Object.keys(restrictions);
			var allergies = [];

			for (var i = keys.length - 1; i >= 0; i--) {
				if (restrictions[keys[i]]) {
					allergies.push(keys[i]);
				};
			};

			return allergies;
		} else {
			return false
		}
	},
});
