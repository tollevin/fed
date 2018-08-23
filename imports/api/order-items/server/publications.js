import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { OrderItems } from '../order-items.js';

const MAX_ORDERITEMS = 300;

Meteor.publish('all.orderItems', function (limit) {
  new SimpleSchema({
    limit: { type: Number, optional: true },
  }).validate({ limit });

  const options = {
    sort: { created_at: -1 },
    limit: Math.min(limit, MAX_ORDERITEMS),
  };

  return OrderItems.find({}, options);
});
