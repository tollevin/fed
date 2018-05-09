import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment';

// Template
import './subscribers-admin.html';

// Methods
import { autoinsertSubscriberOrder } from '../../api/orders/methods.js';

// Components used inside the template
import '../components/subscriber-preview.js';

Template.Subscribers_admin.onCreated(function subscribersAdminOnCreated() {
  this.autorun(() => {
  	this.subscribe('subscriberData');
  });
});

Template.Subscribers_admin.helpers({
	subscribers() {
		// const new_subs = Meteor.users.find({"subscriptions.status": "trialing", "skipping": null }, { sort: { "subscriptions.created": -1 }}).fetch();
		// const active = Meteor.users.find({"subscriptions.status": "active"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const past_due = Meteor.users.find({"subscriptions.status": "past_due"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const unpaid = Meteor.users.find({"subscriptions.status": "unpaid"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const skipping = Meteor.users.find({"subscriptions.status": "unpaid"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// const canceled = Meteor.users.find({"subscriptions.status": "canceled"}, { sort: { "subscriptions.created": -1 }}).fetch();
		// return Meteor.users.find({"subscriptions.quantity": { $gt: 0 }, "subscriptions.status": { $ne: "canceled" }}, { sort: { "subscriptions.created": -1 }});
		return Meteor.users.find({}, { sort: { "subscriptions.created_at": -1 }});
	},

	numberOfSubscribers() {
		return Meteor.users.find({}).count();
	},
});

Template.Subscribers_admin.events({
	'click #createFixtureSubOrders'(event, template) {
		event.preventDefault();

		var subscribers = Meteor.users.find({"subscriptions.status": { $nin: ['canceled', null] }}).fetch();
		var week_of = moment().startOf('week').toDate();
		var week_two = moment().add(1,'week').startOf('week').toDate();
		var week_three = moment().add(2,'week').startOf('week').toDate();
		var weeks = [week_of, week_two, week_three];


		for (var i = subscribers.length - 1; i >= 0; i--) {
			var user = subscribers[i];
			let subItems;
			Meteor.call('getUserSubscriptionItems', user._id, ( error, response ) => {
        if ( error ) {
        	console.log(error + "; error");
				} else {
					subItems = response;

					for (var j = weeks.length - 1; j >= 0; j--) {

						var data = {
							user_id: user._id,
							week_of: weeks[j],
							items: subItems,
						};

						autoinsertSubscriberOrder.call(data);
					};
				};
			});			
		};
	},
});