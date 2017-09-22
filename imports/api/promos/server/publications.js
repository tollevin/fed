import { Meteor } from 'meteor/meteor';

import { Promos } from '../promos.js';

Meteor.publish('all.promos', function allPromos() {
  return Promos.find({});
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