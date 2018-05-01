import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { createDeliveryWindows } from '../delivery/methods.js'

import { 
  Menus
} from './menus.js';

import {
  Items
} from '../items/items.js';

var menusLength = Menus.find({}).fetch.length;

export const insertMenu = new ValidatedMethod({
  name: 'Menus.insert',
  validate: new SimpleSchema({
    name: { type: String },
    items: { type: [ String ], optional: true },
    'items.$': { type: String, optional: true },
    online_at: { type: Date, optional: true },
    custom_until: { type: Date, optional: true },
    offline_at: { type: Date, optional: true },
    ready_by: { type: Date },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ user_id, name, items, online_at, custom_until, offline_at, ready_by }) {

    const ready_by_date = moment(ready_by);
    const on_at = online_at || ready_by_date.subtract(7, 'd').unix;
    const custom_til = custom_until || ready_by_date.add(4, 'd').unix;
    const off_at = offline_at || ready_by_date.endOf('week').unix;

    const menu = {
      id_number: menusLength,
      name,
      items,
      online_at: on_at,
      custom_until: custom_til,
      offline_at: off_at,
      ready_by,
    };

    createDeliveryWindows.call({
      ready_by_date: ready_by_date
    }, (err, res) => {
      if (err) {
        console.log(err.error);
      }

      menu.delivery_windows = res;
    });
    
    const menuId = Menus.insert(menu);
    const result = Menus.findOne({_id: menuId});
    return result;
  },
});

// Get list of all method names on menus
const Menus_METHODS = _.pluck([
  insertMenu,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(Menus_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
