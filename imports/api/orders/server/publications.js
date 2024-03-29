import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { moment } from 'meteor/momentjs:moment';
import { toNewYorkTimezone } from '/imports/ui/lib/time';

import { Orders } from '../orders.js';

const MAX_ORDERS = 1000;

Meteor.publish('some.orders', function (limit) {
  new SimpleSchema({
    limit: { type: Number, optional: true },
  }).validate({ limit });

  const options = {
    sort: { created_at: -1 },
    limit: Math.min(limit, MAX_ORDERS),
  };

  return Orders.find({ status: { $in: ['created', 'custom-sub', 'pending-sub'] } }, options);
});

Meteor.publish('single.order', function singleOrder(id) {
  return Orders.find({ _id: id });
});

Meteor.publish('allThisWeeks.orders', function thisWeeksOrders({ timestamp, filters }) {
  const nowInNY = toNewYorkTimezone(moment(timestamp));
  const nyWeekStart = nowInNY.startOf('week').toDate();
  return Orders.find({ status: { $in: filters || ['created', 'custom-sub', 'skipped', 'pending-sub'] }, week_of: nyWeekStart });
});

Meteor.publish('thisUsersFuture.orders', function thisUsersOrders(timestamp) {
  const time = toNewYorkTimezone(moment(timestamp)).toDate();
  const args = {
    user_id: Meteor.userId(),
    ready_by: { $gte: time },
    status: { $nin: ['pending', 'canceled'] },
  };

  return Orders.find(args);
});

Meteor.publish('Future.orders', function futureOrders(timestamp) {
  const time = moment.utc(timestamp).toDate();
  const args = {
    ready_by: { $gte: time },
    status: { $nin: ['pending', 'canceled'] },
  };

  return Orders.find(args);
});
