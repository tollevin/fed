import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Plans } from '../plans.js';


// Meteor.publish('some.plans', function(limit) {
//   new SimpleSchema({
//     limit: { type: Number, optional: true }
//   }).validate({ limit });

//   const options = {
//     sort: {createdAt: -1},
//     limit: Math.min(limit, MAX_ORDERS)
//   };

//   return Orders.find({"status": { $in: ['created', 'creating'] }}, options);
// });