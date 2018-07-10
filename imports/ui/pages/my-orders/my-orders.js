import { Template } from 'meteor/templating';

// Components
import '/imports/ui/components/order-toggle/order-toggle.js';

import './my-orders.html';

Template.My_Orders.onCreated(function myOrdersOnCreated() {
	this.autorun(() => {
		this.subscribe('Orders.thisUser');
	});
});

Template.My_Orders.helpers({
	nextOrder: ()=> {

	},

	futureOrders: ()=> {

	},
});
