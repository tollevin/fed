import { Template } from 'meteor/templating';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import { Orders } from '/imports/api/orders/orders.js';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';

// Methods
import { toggleSkip } from '/imports/api/orders/methods.js';

// Template
import './order-toggle.html';

Template.Order_toggle.onCreated(function orderToggleOnCreated() {
	this.subscribe('DeliveryWindows.forMenu', this.data.menu_id);
	this.subscribe('single.order', this.data._id);

	this.delivery_window = new ReactiveVar();
	this.status = new ReactiveVar();

	this.autorun(()=> {
		if (this.subscriptionsReady()) {
			const dw = DeliveryWindows.findOne({_id: this.data.delivery_window_id})
			this.delivery_window.set(dw);

			const order = Orders.findOne({_id: this.data._id});
			this.status.set(order.status);
		};
	});
});

Template.Order_toggle.onRendered(function orderToggleOnRendered() {
	
});

Template.Order_toggle.helpers({
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

	checked: ()=> {
		return['skipped','canceled'].indexOf(Template.instance().status.get()) <= -1;
	},
});

Template.Order_toggle.events({
	'click .switch, touchstart .switch'(event, template) {
		event.preventDefault();
		// const order = Orders.findOne({_id: template._id});
		const data = {
			order_id: template.data._id
		}
		toggleSkip.call(data);
	},
});