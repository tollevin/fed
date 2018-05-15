import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import moment from 'moment';

import { Orders } from '../orders.js';

const MAX_ORDERS = 1000;

Meteor.publish('some.orders', function(limit) {
  new SimpleSchema({
    limit: { type: Number, optional: true }
  }).validate({ limit });

  const options = {
    sort: {created_at: -1},
    limit: Math.min(limit, MAX_ORDERS)
  };

  return Orders.find({"status": { $in: ['created', 'custom-sub'] }}, options);
});

Meteor.publish('single.order', function singleOrder(id) {
  return Orders.find({_id: id});
});

Meteor.publish('thisWeeks.orders', function thisWeeksOrders() {
  var now = moment();
  var isSundayBeforeNoon = (moment().day() === 0) && (moment().hour < 12);
  let ordersResetTime;

  if (isSundayBeforeNoon) {
    ordersResetTime = moment().day(-7).hour(12).minute(1).second(0).toISOString();
  } else {
    ordersResetTime = moment().day(0).hour(12).minute(1).second(0).toISOString();
  };

  const options = {
    sort: {created_at: -1},
  };

  return Orders.find({"status": { $in: ['created', 'custom-sub'] }, "created_at": { $gte: new Date(ordersResetTime) }}, options);
});

Meteor.publish('thisUsersFuture.orders', function thisUsersOrders(timestamp) {

  const args = {
    user_id: Meteor.userId(),
    ready_by: { $gte: timestamp },
    status: { $nin: ['pending','canceled'] },
  };
  
  return Orders.find(args);
})