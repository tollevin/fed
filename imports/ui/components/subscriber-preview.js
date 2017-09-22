import './subscriber-preview.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { 
  MH,
  MH_20
} from '../../api/delivery/zipcodes.js';

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
		const basePrice = Template.currentData().subscriptions.plan.amount / 100;
		const saleAmount = basePrice * (100 - Number(Template.currentData().subscriptions.discount.coupon.id.split('b')[1])) / 100;
		return saleAmount;
	},

	processStatus(status) {
		const skipping = Template.currentData().skipping;
		const now = moment().unix();
		const nextThurs = moment().day(11).unix();

		let lastOrderReadyBy;
		if (Template.currentData().last_purchase) {
			lastOrderReadyBy = moment(Template.currentData().last_purchase.ready_by).unix();
		} else {
			lastOrderReadyBy = false;
		};

		let lastOrderInFuture;
		if (lastOrderReadyBy) {
			lastOrderInFuture = now < lastOrderReadyBy;
		} else {
			lastOrderInFuture = false;
		};

		let paused;
		if (Template.currentData().subscriptions.trial_end > nextThurs) {
			paused = true;
		} else {
			paused = false;
		};
		

		if (status === "trialing" && skipping) {
			return "skipping";
		} else if (status === "trialing" && lastOrderInFuture) {
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
});