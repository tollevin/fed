import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import moment from 'moment';

// Collections
import { Orders } from '/imports/api/orders/orders.js';

// Components
import '/imports/ui/components/order-toggle/order-toggle.js';

import './my-orders.html';

Template.My_Orders.onCreated(function myOrdersOnCreated() {
	this.autorun(() => {
		this.subscribe('Orders.thisUser');
	});
});

Template.My_Orders.onRendered(function myOrdersOnRendered() {
	
});

Template.My_Orders.helpers({
	nextOrder: ()=> {

	},

	futureOrders: ()=> {

	},
});

Template.My_Orders.events({

});