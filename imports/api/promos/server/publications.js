import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Promos } from '../promos.js';

const MAX_PROMOS = 1000;

Meteor.publish('all.promos', function allPromos(limit) {
  new SimpleSchema({
    limit: { type: Number },
  }).validate({ limit });

  const options = {
    sort: { createdAt: -1 },
    limit: Math.min(limit, MAX_PROMOS),
  };

  return Promos.find({}, options);
});

Meteor.publish('single.promo', function singlePromo(code) {
  if (!Promos.findOne({ code })) { return []; }
  return Promos.find({ code });
});

Meteor.publish('Promos.totalCount', function() {
  Counts.publish(this, 'Promos.totalCount', Promos.find({}));
});
