import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { moment } from 'meteor/momentjs:moment';
import { toNewYorkTimezone } from '/imports/ui/lib/time';

import { Menus } from '../menus.js';
import { Items } from '../../items/items.js';

Meteor.publishComposite('Menus.thisWeek', function (timestamp) {
  new SimpleSchema({
    timestamp: { type: Date },
  }).validate({ timestamp });

  return {
    find() {
      const thisWeeksStart = toNewYorkTimezone(moment(timestamp)).startOf('week').utc()
        .toDate();
      const lastWeeksStart = toNewYorkTimezone(moment(timestamp)).startOf('week').subtract(1, 'week')
        .utc()
        .toDate();

      let menu = Menus.find({ online_at: thisWeeksStart });
      if (!menu) menu = Menus.find({ online_at: lastWeeksStart });

      return menu;
    },
    children: [{
      find(menu) {
        return Items.find({
          _id: { $in: menu.items },
        });
      },
    },
    {
      find() {
        return Items.find({ active: true });
      },
    }],
  };
});

Meteor.publishComposite('Menus.byWeek', function (timestamp) {
  new SimpleSchema({
    timestamp: { type: Date },
  }).validate({ timestamp });

  return {
    find() {
      const thisWeeksStart = toNewYorkTimezone(moment(timestamp)).startOf('week').utc()
        .toDate();
      return Menus.find({ week_of: thisWeeksStart });
    },
    children: [{
      find(menu) {
        return Items.find({
          _id: { $in: menu.items },
        });
      },
    },
    {
      find() {
        return Items.find({ active: true });
      },
    }],
  };
});

Meteor.publishComposite('Menus.active', function () {
  return {
    find() {
      return Menus.find({ active: true });
    },
    children: [{
      find(menu) {
        return Items.find({
          _id: { $in: menu.items },
        });
      },
    },
    {
      find() {
        return Items.find({ active: true });
      },
    }],
  };
});

Meteor.publish('Menus.toCome', function () {
  return Menus.find({ ready_by: { $gte: new Date() } }, { sort: { ready_by: 1 } });
});
