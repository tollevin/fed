import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { BrowserPolicy } from 'meteor/browser-policy-common';

BrowserPolicy.content.allowSameOriginForAll();
BrowserPolicy.content.allowDataUrlForAll();
BrowserPolicy.content.allowOriginForAll( '*.stripe.com' );
BrowserPolicy.content.allowOriginForAll( 'https://getfednyc.com' );
BrowserPolicy.content.allowOriginForAll( '*.google.com' );
BrowserPolicy.content.allowOriginForAll( '*.google-analytics.com' );
BrowserPolicy.content.allowOriginForAll( '*.googletagmanager.com' );
BrowserPolicy.content.allowOriginForAll( '*.optimizely.com' );
BrowserPolicy.content.allowOriginForAll( '*.doubleclick.net' );
BrowserPolicy.content.allowOriginForAll( '*.facebook.net' );
BrowserPolicy.content.allowOriginForAll( '*.facebook.com' );
BrowserPolicy.content.allowOriginForAll( '*.segment.com' );

// Don't let people write arbitrary data to their 'profile' field from the client
Meteor.users.deny({
  update() {
    return true;
  },
});

// Get a list of all accounts methods by running `Meteor.server.method_handlers` in meteor shell
const AUTH_METHODS = [
  'login',
  'logout',
  'logoutOtherClients',
  'getNewToken',
  'removeOtherTokens',
  'configureLoginService',
  'changePassword',
  'forgotPassword',
  'resetPassword',
  'verifyEmail',
  'createUser',
  'ATRemoveService',
  'ATCreateUserServer',
  'ATResendVerificationEmail',
];

if (Meteor.isServer) {
  // Only allow 2 login attempts per connection per 5 seconds
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(AUTH_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 2, 5000);
}
