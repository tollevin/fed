/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Items } from '../items.js';

Meteor.publish('items.thisWeek', function itemsThisWeek() {
  return Items.find({
    active: true,
  });
});

Meteor.publish('items.all', function itemsAll() {
  return Items.find({});
});

Meteor.publish('singleItem', function(id) {
  check(id, String);
  return Items.find({_id: id});
});