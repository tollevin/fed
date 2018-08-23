import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class SlotsCollection extends Mongo.Collection {
  insert(slot, callback) {
    const ourSlot = slot;
    ourSlot.createdAt = ourSlot.createdAt || new Date();
    return super.insert(ourSlot, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(slot, callback) {
    return super.remove(slot, callback);
  }
}

export const Slots = new SlotsCollection('Slots');

// Deny all client-side updates since we will be using methods to manage this collection
Slots.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Slots.schema = new SimpleSchema({
  _id: {
    type: String,
    label: '_id',
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      type: 'hidden',
    },
  },
  created_at: {
    type: Date,
    label: 'Created at',
  },
  user_id: {
    type: String,
    label: 'User ID',
    regEx: SimpleSchema.RegEx.Id,
  },
  sub_id: {
    type: String,
    label: 'Subscription ID',
    regEx: SimpleSchema.RegEx.Id,
  },
  category: {
    type: String,
    label: 'Category'
  },
  restrictions: {
    type: Array,
    label: 'Restrictions',
  },
  'restrictions.$': {
    type: String,
    label: 'Restricted Ingredient',
    optional: true
  },
  static: {
    type: Boolean,
    label: 'Static Item',
    defaultValue: false,
  },
});

Slots.attachSchema(Slots.schema);

// This represents the keys from Slots objects that should be published
// to the client. If we add secret properties to objects, don't list
// them here to keep them private to the server.
Slots.publicFields = {
  _id: 1,
  created_at: 1,
  user_id: 1,
  sub_id: 1,
  category: 1,
  restrictions: 1,
  static: 1,
};

Slots.helpers({

});
