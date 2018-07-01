import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';
import 'moment-timezone';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import { Orders } from '/imports/api/orders/orders.js';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';

// Methods
import { toggleSkip } from '/imports/api/orders/methods.js';

// Template
import './order-detail-panel.html';

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

	locked: ()=> {
		const timestamp = moment().tz('America/New_York');
		return ( timestamp.day() < 4 || ( timestamp.day() === 0 && timestamp.hour() < 12 ) ) && 'locked';
	},

	status: ()=> {
		switch (Template.instance().status.get()) {
			case 'created':
				return 'Paid';
			case 'pending':
				return 'Pending';
			case 'pending-sub':
				return 'Pending';
			case 'skipped':
				return 'Skipped';
		};
	},

	itemsTally: ()=> {
    var itemList = Template.currentData().items;
    var itemTally = {};

    for (var i = itemList.length - 1; i >= 0; i--) {
      if (!itemTally[itemList[i].name]) {
        itemTally[itemList[i].name] = 1;
      } else {
        itemTally[itemList[i].name] += 1;
      };
    };
    
    var result = [];
    for (var key in itemTally) result.push({name:key,value:itemTally[key]});
    return result;
  },

  isPack: (item)=> {
    return item.name.split('-')[1] === 'Pack';
  },

  subitems: (item)=> {
    var orderItemList = Template.currentData().items;
    var subItemList = [];
    var subItemTally = {};

    for (var i = orderItemList.length - 1; i >= 0; i--) {
      if (orderItemList[i].name === item.name) {
        subItemList = orderItemList[i].sub_items.items;
      };
    };

    for (var i = subItemList.length - 1; i >= 0; i--) {
      if (!subItemTally[subItemList[i].name]) {
        subItemTally[subItemList[i].name] = 1;
      } else {
        subItemTally[subItemList[i].name] += 1;
      };
    };
    
    var result = [];
    for (var key in subItemTally) result.push({name:key,value:subItemTally[key]});
    return result;
  },
});

Template.Order_detail_panel.events({
	'click .switch'(event, template) {
		event.preventDefault();

		const timestamp = moment().tz('America/New_York');
		var able = false;

		if ((timestamp.day() === 0)) {
			if (timestamp.hour() > 12) {
				able = true;
			};
		} else if (timestamp.day() < 4) {
			able = true;
		};

		if (able) {
			const order = Orders.findOne({});
			const data = {
				order_id: order._id
			}
			toggleSkip.call(data);
		};
	},

	'click .edit-order'(event, template) {
		event.preventDefault();

		Session.set('overlay', 'packEditor');
	},
});