import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Orders } from '../orders.js';

const MAX_ORDERS = 1000;

Meteor.publish('some.orders', function(limit) {
  new SimpleSchema({
    limit: { type: Number, optional: true }
  }).validate({ limit });

  const options = {
    sort: {createdAt: -1},
    limit: Math.min(limit, MAX_ORDERS)
  };

  // ...
  return Orders.find({"status": { $in: ['created', 'creating'] }}, options);
});

Meteor.publish('all.orders', function allOrders() {
  return Orders.find({});
});

Meteor.publish('single.order', function singleOrder(id) {
  // check(id, String);
  return Orders.find({_id: id});
});

