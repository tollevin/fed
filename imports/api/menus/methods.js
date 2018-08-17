import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { moment } from 'meteor/momentjs:moment';
import { toNewYorkTimezone } from '/imports/ui/lib/time';

// Collections
import { Menus } from './menus.js';

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
    name,
    items,
    online_at: onlineAt,
    custom_until: customUntil,
    offline_at: offlineAt,
    ready_by: readyBy,
  }) {
    const readyByDate = toNewYorkTimezone(moment(readyBy));
    const onAt = onlineAt || readyByDate.subtract(7, 'd').toDate();
    const customTil = customUntil || readyByDate.add(4, 'd').toDate();
    const offAt = offlineAt || readyByDate.endOf('week').toDate();

    const menu = {
      created_at: new Date(),
      id_number: menusLength,
      name,
      items,
      online_at: onAt,
      custom_until: customTil,
      offline_at: offAt,
      ready_by: readyBy,
    };

    createDeliveryWindows.call({
      ready_by_date: readyBy,
    }, (err, res) => {
      if (err) { return undefined; }
      menu.delivery_windows = res;
      const menuId = Menus.insert(menu);
      return Menus.findOne({ _id: menuId });
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
  run({ menu_id: menuId }) {
    const menu = Menus.findOne({ _id: menuId });
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
    return Menus.find({ online_at: { $gte: timestamp } });
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
  run({ online_at: onlineAt }) {
    const time = moment.utc(onlineAt).toDate();
    return Menus.find({ online_at: time });
  },
});


// Get list of all method names on menus
const MENUS_METHODS = _.pluck([
  insertMenu,
  getMenuDWs,
  getFutureMenus,
  getNextWeeksMenu,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 orders operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(MENUS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
