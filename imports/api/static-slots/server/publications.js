import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { StaticSlots } from '../static-slots.js';

const MAX_STATIC_SLOTS = 300;

Meteor.publish('all.staticSlots', function (limit) {
  new SimpleSchema({
    limit: { type: Number, optional: true },
  }).validate({ limit });

  const options = {
    sort: { created_at: -1 },
    limit: Math.min(limit, MAX_STATIC_SLOTS),
  };

  return StaticSlots.find({}, options);
});
