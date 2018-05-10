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
import {
	toggleSkip
// 	changeOrderDeliveryWindow,
// 	changeOrderAddress,
// 	// changeOrderRecipient,

} from '../../api/orders/methods.js';

Template.Order_detail_panel.onCreated(function orderDetailPanelOnCreated() {
	this.subscribe('DeliveryWindows.forMenu', this.data.menu_id);
	this.subscribe('single.Order', this.data._id);
	
	this.delivery_window = new ReactiveVar();
	this.status = new ReactiveVar();


	this.autorun(()=> {
		if (this.subscriptionsReady()) {
			const dw = DeliveryWindows.findOne({_id: this.data.delivery_window_id});
			this.delivery_window.set(dw);

			const order = Orders.findOne({});
			this.status.set(order.status);
		};
	});
});

Template.Order_detail_panel.onRendered(function orderDetailPanelOnRendered() {
	
});

Template.Order_detail_panel.helpers({
	date: ()=> {
		const dw = Template.instance().delivery_window.get();
		console.log(dw);
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
		return ['skipped','canceled'].indexOf(Template.instance().status.get()) <= -1;
	},

	status: ()=> {
		switch (Template.instance().status.get()) {
			case 'created':
				return 'Received';
			case 'pending':
				return 'Pending';
			case 'pending-sub':
				return 'Pending';
			case 'skipped':
				return 'Skipped';
		};
	},
});

Template.Order_detail_panel.events({
	'click .switch'(event, template) {
		event.preventDefault();

		const order = Orders.findOne({});
		const data = {
			order_id: order._id
		}
		toggleSkip.call(data);
	},
});