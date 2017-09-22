import './customers-toolbar.html';

// Template.Customers_toolbar.onCreated(function customersToolbarOnCreated() {
// });

Template.Customers_toolbar.events({
	'click #Refresh' (event) {
		event.preventDefault()

		Meteor.call('updateAllSubscriptions', ( error, response ) => {
			if (error) {
				console.log(error);
			};
		});
	},

	'click #PauseAll' (event) {
		event.preventDefault();

		Meteor.call('pauseAllSubscriptions', ( error, response ) => {
			if (error) {
				console.log(error);
			} else {
				sAlert.success(response + " subscriptions PAUSED")
			};
		});
	},

	'click #DeleteMe' (event) {
		event.preventDefault();

		Meteor.call('updatePassword', (error, response) => {
			if (error) {
				console.log(error);
			} else {
				sAlert.success(response + " PWC")
			};
		});
	},
});