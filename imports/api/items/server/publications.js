/* eslint-disable prefer-arrow-callback */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Items } from '../items.js';

Meteor.publish('items.active', function itemsActive() {
  return Items.find({ active: true });
});

Meteor.publish('items.all', function itemsAll() {
  return Items.find({});
});

Meteor.publish('singleItem', function singleItem(id) {
  check(id, String);
  return Items.find({ _id: id });
});

Meteor.publish('Items.packs', function itemsPacks() {
  const options = {
    fields: {
      _id: 1,
      name: 1,
      category: 1,
      description: 1,
      price_per_unit: 1,
      sub_items: 1,
    },
  };

  return Items.find({ category: 'Pack' }, options);
});
