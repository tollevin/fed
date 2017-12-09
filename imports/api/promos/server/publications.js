import { Meteor } from 'meteor/meteor';

import { Promos } from '../promos.js';

const MAX_PROMOS = 1000;

Meteor.publish('all.promos', function allPromos(limit) {
  new SimpleSchema({
    limit: { type: Number }
  }).validate({ limit });

  const options = {
    sort: {createdAt: -1},
    limit: Math.min(limit, MAX_PROMOS)
  };

  return Promos.find({}, options);
});

Meteor.publish('single.promo', function singlePromo(code) {
  // check(id, String);
  if (Promos.findOne({code: code})) {
	  const promoCursor = Promos.find({code: code});
  	return promoCursor;
	  this.ready();
  } else {
  	return [];
  	this.error('Invalid promo code');
  };
});

Meteor.publish('Promos.totalCount', function() {
  Counts.publish(this, `Promos.totalCount`, Promos.find({}));
});