import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';

import {
	DeliveryWindows
} from '../../api/delivery/delivery-windows.js';

import './scheduling-toggles.html';

Template.Scheduling_toggles.onCreated(function schedulingTogglesOnCreated() {
  const now = moment().toDate();

	this.autorun(() => {
		// Subscribe to delivery windows for the next 2 menus
		var subs = this.subscribe('DeliveryWindows.nextTwoWeeks', now);

		// if (subs.ready()) {
		// };
	});
});

Template.Scheduling_toggles.onRendered(function schedulingTogglesOnRendered() {
});

Template.Scheduling_toggles.helpers({
	deliveries: ()=> {
		const preferredDelivDay = Session.get('formData').preferredDelivDay;
		console.log(preferredDelivDay);
		const deliveries = DeliveryWindows.find({'delivery_day': preferredDelivDay});
		return deliveries
	},
});

Template.toggle.helpers({
	dateString: ()=> {
		const date = moment(Template.currentData().delivery_start_time);
		const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
		const dateToString = date.format("dddd, MMMM Do, h") + '-' + endDate.format("ha");
		return dateToString;
	},
});

Template.Scheduling_toggles.events({

});