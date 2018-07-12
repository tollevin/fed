import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
  PackSchemas,
} from './packs.js';

export const generatePacksByDiet = new ValidatedMethod({
  name: 'packs.generate',
  validate: new SimpleSchema({
    diet: { type: String },
  }).validator(),
  run({ diet }) {
    const packListObject = PackSchemas[diet];
    return packListObject;
  },
});
