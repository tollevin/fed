import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import moment from 'moment';

import { Menus } from '../menus.js';
import { Items } from '../../items/items.js';

Meteor.publishComposite('Menus.thisWeek', function(now) {
  new SimpleSchema({
    now: {type: Date}
  }).validate({ now });

  return {
    find() {
      const thisWeeksStart = moment(now).startOf('week').toDate();
      return Menus.find({"active": true});
    },
    children: [{
      find(menu) {
        return Items.find({
          _id: {$in: menu.items},
        });
      }
    },
    {
      find() {
        return Items.find({active: true});
      }
    }]
  };
});

Meteor.publishComposite('Menus.byWeek', function(timestamp) {
  new SimpleSchema({
    timestamp: {type: Date}
  }).validate({ timestamp });

  return {
    find() {
      const thisWeeksStart = moment(timestamp).startOf('week').toDate();
      return Menus.find({"week_of": thisWeeksStart});
    },
    children: [{
      find(menu) {
        return Items.find({
          _id: {$in: menu.items},
        });
      }
    },
    {
      find() {
        return Items.find({active: true});
      }
    }]
  };
});

Meteor.publishComposite('Menus.active', function() {

  return {
    find() {
      return Menus.find({"active": true});
    },
    children: [{
      find(menu) {
        return Items.find({
          _id: {$in: menu.items},
        });
      }
    },
    {
      find() {
        return Items.find({active: true});
      }
    }]
  };
});

Meteor.publish('Menus.toCome', function itemsAll() {
  return Menus.find({ready_by: {$gte: new Date()}}, {sort: {ready_by: 1}});
});