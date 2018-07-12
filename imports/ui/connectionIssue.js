import { ReactiveVar } from 'meteor/reactive-var';

const CONNECTION_ISSUE_TIMEOUT = 6000;

// A store which is local to this file?
export const showConnectionIssue = new ReactiveVar(false);

Meteor.startup(function () {
  setTimeout(() => {
    // FIXME:
    // Launch screen handle created in lib/router.js
    // dataReadyHold.release();

    // Show the connection error box
    showConnectionIssue.set(true);
  }, CONNECTION_ISSUE_TIMEOUT);
});
