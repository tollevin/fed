import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import {
  zipZones,
} from './zipcodes.js';

import {
  DeliveryWindows,
} from './delivery-windows.js';

export const getZipZone = new ValidatedMethod({
  name: 'delivery.getZone',
  validate: new SimpleSchema({
    zip_code: { type: String },
  }).validator({ clean: true, filter: false }),
  run({ zip_code }) {
    return zipZones.zip_code;
  },
});

export const createDeliveryWindows = new ValidatedMethod({
  name: 'delivery.insertDeliveryWindows',
  validate: new SimpleSchema({
    ready_by_date: { type: Date },
  }).validator({ clean: true, filter: false }),
  run({ ready_by_date }) {
    const sundayDeliveryStart = moment(ready_by_date).hour(18).utc().toDate();
    const sundayDeliveryEnd = moment(ready_by_date).hour(21).utc().toDate();
    const mondayDeliveryStart = moment(ready_by_date).add(1, 'd').hour(18).utc()
      .toDate();
    const mondayDeliveryEnd = moment(ready_by_date).add(1, 'd').hour(21).utc()
      .toDate();

    const delivery_window_1 = {
      created_at: moment.utc().toDate(),
      delivery_start_time: sundayDeliveryStart,
      delivery_end_time: sundayDeliveryEnd,
      delivery_day: 'sunday',
    };

    const delivery_window_2 = {
      created_at: moment.utc().toDate(),
      delivery_start_time: mondayDeliveryStart,
      delivery_end_time: mondayDeliveryEnd,
      delivery_day: 'monday',
    };

    const dw1 = DeliveryWindows.insert(delivery_window_1);
    const dw2 = DeliveryWindows.insert(delivery_window_2);
    const results = [dw1, dw2];

    return results;
  },
});

// Get list of all method names on delivery windows
const DeliveryWindows_METHODS = _.pluck([
  createDeliveryWindows,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 items operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(DeliveryWindows_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
