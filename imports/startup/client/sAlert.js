import { Meteor } from 'meteor/meteor';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { lodash } from 'meteor/erasaur:meteor-lodash';

Meteor.startup(function () {
  sAlert.config({
    effect: '',
    position: 'top-right',
    timeout: 5000,
    html: false,
    onRouteClose: true,
    stack: true,
    // or you can pass an object:
    // stack: {
    //     spacing: 10 // in px
    //     limit: 3 // when fourth alert appears all previous ones are cleared
    // }
    // in px - will be added to first alert (bottom or top - depends of the position in config)
    offset: 0,
    beep: false,
    // examples:
    // beep: '/beep.mp3'  // or you can pass an object:
    // beep: {
    //     info: '/beep-info.mp3',
    //     error: '/beep-error.mp3',
    //     success: '/beep-success.mp3',
    //     warning: '/beep-warning.mp3'
    // }
    onClose: lodash.noop, //
    // examples:
    // onClose: function() {
    //     /* Code here will be executed once the alert closes. */
    // }
  });

  sAlert.config({
    effect: 'stackslide',
    position: 'bottom-right',
    timeout: 4000,
    html: false,
    onRouteClose: true,
    stack: true,
    // or you can pass an object:
    // stack: {
    //     spacing: 10 // in px
    //     limit: 3 // when fourth alert appears all previous ones are cleared
    // }
    // in px - will be added to first alert (bottom or top - depends of the position in config)
    offset: 100,
    beep: false,
    // examples:
    // beep: '/beep.mp3'  // or you can pass an object:
    // beep: {
    //     info: '/beep-info.mp3',
    //     error: '/beep-error.mp3',
    //     success: '/beep-success.mp3',
    //     warning: '/beep-warning.mp3'
    // }
    onClose: lodash.noop, //
    // examples:
    // onClose: function() {
    //     /* Code here will be executed once the alert closes. */
    // }
  });
});
