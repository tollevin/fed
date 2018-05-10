import './subscriber-preview.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { 
  MH,
  MH_20
} from '../../api/delivery/zipcodes.js';

import { 
  getZipZone
} from '../../api/delivery/methods.js';

Template.Subscriber_preview.onCreated(function subscriberPreviewOnCreated() {
	// this.autorun(() => {
	// 	if (Template.currentData().coupon) {
	// 		console.log(Template.currentData().first_name + " " + Template.currentData().coupon);
	// 	} else {
	// 		if (Template.currentData().subscriptions.discount) {
	// 			let data = {
	// 				"coupon": Template.currentData().subscriptions.discount.coupon.id,
	// 			};

	// 			let user = Template.currentData()._id;

	// 			Meteor.call( 'updateUser', user, data, ( error, response ) => {
	//         if ( error ) {
	//           console.log(error + "; error");
	//         };
	//       });
	// 		} else {
	// 			let data = {
	// 				"coupon": "Sub10",
	// 			};

	// 			let user = Template.currentData()._id;

	// 			Meteor.call( 'updateUser', user, data, ( error, response ) => {
	//         if ( error ) {
	//           console.log(error + "; error");
	//         };
	//       });
	// 		};
	// 	};
	// });
});

Template.Subscriber_preview.helpers({
	subscribedAt() {
		const subDate = new moment(Template.currentData().subscriptions.created * 1000);
		return subDate.toDate();
	},

	emailss() {
		const emails = Template.currentData().emails;
		return emails;
	},

	delivFee() {
		const zip = Template.currentData().address_zipcode;
		if (MH.indexOf(zip) > -1) {
      return 13;
    } else if (MH_20.indexOf(zip) > -1) {
      return 20;
    } else {
    	return 0;
    };
	},

	saleAmount() {
		// Price - Discount
		if (Template.currentData().subscriptions) {
			const basePrice = Template.currentData().subscriptions.plan.amount / 100;
			const saleAmount = basePrice * (100 - Number(Template.currentData().subscriptions.discount.coupon.id.split('b')[1])) / 100;
			return saleAmount;
		};
	},

	taxAmount() {
		if (Template.currentData().subscriptions) {
			const basePrice = Template.currentData().subscriptions.plan.amount / 100; // Cost of plan
			const saleAmount = basePrice * (100 - Number(Template.currentData().subscriptions.discount.coupon.id.split('b')[1])) / 100;
			const taxAmount = (saleAmount * .08875);
			return taxAmount.toFixed(2);
		};
	},

	total() {
		if (Template.currentData().subscriptions) {
			const basePrice = Template.currentData().subscriptions.plan.amount / 100;
			const saleAmount = basePrice * (100 - Number(Template.currentData().subscriptions.discount.coupon.id.split('b')[1])) / 100;
			const taxAmount = saleAmount * .08875;
	    const totalAmount = saleAmount + taxAmount;
	    return totalAmount.toFixed(2);
	  };
	},

	processStatus(status) {
		const skipping = Template.currentData().skipping;
		// const now = moment().unix();
		const nextFri = moment().day(12).unix();

		// let lastOrderReadyBy;
		// if (Template.currentData().last_purchase) {
		// 	lastOrderReadyBy = moment(Template.currentData().last_purchase.ready_by).unix();
		// } else {
		// 	lastOrderReadyBy = false;
		// };

		// let lastOrderInFuture;
		// if (lastOrderReadyBy) {
		// 	lastOrderInFuture = now < lastOrderReadyBy;
		// } else {
		// 	lastOrderInFuture = false;
		// };

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
		const keys = Object.keys(restrictions);
		var allergies = [];

		for (var i = keys.length - 1; i >= 0; i--) {
			if (restrictions[keys[i]]) {
				allergies.push(keys[i]);
			};
		};

		return allergies;
	},
});

Template.Subscriber_preview.events({
	'click .customer-notes' (event, template) {

	}
});
