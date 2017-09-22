const resetSkippers = () => {
	const thisThurs = "Until " + new moment().day(4).format("MM/DD/YY");
	const skippers = Meteor.users.find({skipping: thisThurs});
	for (var i = skippers.length - 1; i >= 0; i--) {
		const skipper = skippers[i]._id;
    const data = {
      skipping: false;
    };

	}
};

const createSubscriberOrders = () => {
	const activeSubscribers = Meteor.users.find({active})...
	for (var i = activeSubscribers.length - 1; i >= 0; i--) {
		const sub = activeSubscribers[i];

	};

};

// SyncedCron.add({
//   name: 'Reset Skippers',
//   schedule: function(parser) {
//     // parser is a later.parse object
//     return parser.text('every Sunday at 12:00 pm');
//   },
//   job: function() {
//     const skippersReset = resetSkippers();
//     return skippersReset;
//   }
// });

SyncedCron.add({
  name: 'Create weekly subscriber orders',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every Thursday at 12:00 am');
  },
  job: function() {
  	const createSubscriberOrders = Met.find({active})
  	
    return ordersProcessedLog;
  }
});