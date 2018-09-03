import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Slots } from '../slots.js';

const MAX_SLOTS = 300;

Meteor.publish('all.slots', function (limit) {
  new SimpleSchema({
    limit: { type: Number, optional: true },
  }).validate({ limit });

  const options = {
    sort: { created_at: -1 },
    limit: Math.min(limit, MAX_SLOTS),
  };

  return Slots.find({}, options);
});
