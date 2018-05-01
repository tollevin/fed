import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import moment from 'moment';

import './my-orders.html';

// Collections
import { Orders } from '../../api/orders/orders.js';

// Components
// import '../components/order-preview.js';
import '../components/order-toggle.js';

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