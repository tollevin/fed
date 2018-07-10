import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './success.less';
import './success.html';

Template.Success_page.onCreated(function successPageOnCreated() {
	this.order = Session.get('giftOrder');
	this.success = new ReactiveVar(false);
	this.autorun(() => {
		if (this.order.status === 'paid') { // Change 'sent' to 'paid'? (FIX)
			const success = Meteor.call('sendGiftCard', this.order);
			// Create a status for the entire flow of an order (FIX)
			this.order.status = 'sent';
			// May want to destroy the Session variable
			Session.set('giftOrder', this.order);
		};
	});
});

Template.Success_page.onRendered(function successPageOnRendered() {

});

Template.Success_page.helpers({
	customer() {
		return Template.instance().order.customer;
	},

	recipient() {
		return Template.instance().order.recipient;
	},

	message() {
		return Template.instance().order.message;
	},

	charge() {
		return Template.instance().order.charge;
	},

	amountString(inCents) {
		return (inCents/100).toFixed(2);
	},

	sourceType(brand) {
		var brandString = brand.replace(/\s+/g, '');
		return brandString.toLowerCase();
	},
});