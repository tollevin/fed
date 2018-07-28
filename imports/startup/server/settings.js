import { Meteor } from 'meteor/meteor';
import { addGoogleTagManager } from 'meteor/fuww:google-tag-manager';

// import { SyncedCron } from 'meteor/percolate:synced-cron';

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
  addGoogleTagManager('GTM-WZ7TT6Z');

  // SyncedCron.start();
});
