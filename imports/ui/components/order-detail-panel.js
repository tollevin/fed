import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';

// Template
import './order-detail-panel.html';

// Collections
import { Orders } from '../../api/orders/orders.js';
import { DeliveryWindows } from '../../api/delivery/delivery-windows.js';

// Methods
// import {
// 	changeOrderDeliveryWindow,
// 	changeOrderAddress,
// 	// changeOrderRecipient,

// } from '../../api/orders/methods.js';

Template.Order_detail_panel.onCreated(function orderDetailPanelOnCreated() {
	this.subscribe('DeliveryWindows.forMenu', this.data.menu_id);
	this.delivery_window = new ReactiveVar();
	this.autorun(()=> {
		if (this.subscriptionsReady()) {
			const dw = DeliveryWindows.findOne({_id: this.data.delivery_window_id});
			this.delivery_window.set(dw);
		};
	});
});

Template.Order_detail_panel.onRendered(function orderDetailPanelOnRendered() {
	
});

Template.Order_detail_panel.helpers({
	date: ()=> {
		const dw = Template.instance().delivery_window.get();
		if (dw) return moment(dw.delivery_start_time).format('dddd, MMM Do');
	},

	time: ()=> {
		const dw = Template.instance().delivery_window.get();
		if (dw) {
			const start = moment(dw.delivery_start_time).format('ha');
			const end = moment(dw.delivery_end_time).format('ha');
			return start + '-' + end;
		};
	},

	active: ()=> {
		return ['skipped','canceled'].indexOf(Template.currentData().status) <= -1;
	},

	status: ()=> {

	},
});

Template.Order_detail_panel.events({
	'click .switch'(event, template) {
		event.preventDefault();

		const checked = event.currentTarget.firstElementChild.checked;
    console.log(checked);
	},
});