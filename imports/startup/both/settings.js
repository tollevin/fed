import { Meteor } from 'meteor/meteor';
// process.env.METEOR_SETTINGS_PRODUCTION = '../../../settings-pro.json';

// Meteor.startup(function() {
//     // This will setup meteor settings from a file on the server
//     Meteor.settings = Npm.require(process.env.METEOR_SETTINGS_PRODUCTION);

//     // If you have public settings that need to be exposed to the client,
//     // you can set them like this
//     if (Meteor.settings && Meteor.settings.public) {
//         __meteor_runtime_config__.PUBLIC_SETTINGS = Meteor.settings.public;
//     }
// });


Meteor.startup(function() {

  // Meteor.settings.public.analyticsSettings = {
  //    "Google Analytics" : {"trackingId": "UA-87043528-1"},
  //    "Segment.io"       : {"apiKey": "d92E1Ad5B1RYzvKZCwsBLXCbzaxLqUjx"}
  // };

  // analytics.load("d92E1Ad5B1RYzvKZCwsBLXCbzaxLqUjx");
});
