import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import moment from 'moment';

// Collections
import { Menus } from './menus.js';
import { Items } from '../items/items.js';

// Methods
import { createDeliveryWindows } from '../delivery/methods.js';

const menusLength = Menus.find({}).fetch.length;

export const insertMenu = new ValidatedMethod({
  name: 'Menus.insert',
  validate: new SimpleSchema({
    name: { type: String },
    items: { type: [String], optional: true },
    'items.$': { type: String, optional: true },
    online_at: { type: Date, optional: true },
    custom_until: { type: Date, optional: true },
    offline_at: { type: Date, optional: true },
    ready_by: { type: Date },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    user_id, name, items, online_at, custom_until, offline_at, ready_by,
  }) {
    const ready_by_date = moment(ready_by);
    const on_at = online_at || ready_by_date.subtract(7, 'd').toDate();
    const custom_til = custom_until || ready_by_date.add(4, 'd').toDate();
    const off_at = offline_at || ready_by_date.endOf('week').toDate();

    const menu = {
      created_at: new Date(),
      id_number: menusLength,
      name,
      items,
      online_at: on_at,
      custom_until: custom_til,
      offline_at: off_at,
      ready_by,
    };

    createDeliveryWindows.call({
      ready_by_date: ready_by,
    }, (err, res) => {
      if (err) {
        console.log(err.error);
      } else {
        menu.delivery_windows = res;
        const menuId = Menus.insert(menu);
        const result = Menus.findOne({ _id: menuId });
        return result;
      }
    });
  },
});

export const getMenuDWs = new ValidatedMethod({
  name: 'Menus.DWs',
  validate: new SimpleSchema({
    menu_id: { type: String },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ menu_id }) {
    const menu = Menus.findOne({ _id: menu_id });
    return menu.delivery_windows;
  },
});

export const getFutureMenus = new ValidatedMethod({
  name: 'Menus.getFuture',
  validate: null,
  applyOptions: {
    noRetry: true,
  },
  run() {
    const timestamp = moment.utc().toDate();
    const menus = Menus.find({ online_at: { $gte: timestamp } });
    return menus;
  },
});

export const getNextWeeksMenu = new ValidatedMethod({
  name: 'Menus.getNextWeeks',
  validate: new SimpleSchema({
    online_at: { type: Date },
  }).validator({}),
  applyOptions: {
    noRetry: true,
  },
  run(online_at) {
    const time = moment.utc(online_at).toDate();
    console.log(time);
    const menu = Menus.find({ online_at: time });
    return menu;
  },
});


// Get list of all method names on menus
const Menus_METHODS = _.pluck([
  insertMenu,
  getMenuDWs,
  getFutureMenus,
  getNextWeeksMenu,
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
