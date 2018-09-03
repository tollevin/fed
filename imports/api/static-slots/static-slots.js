import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class StaticSlotsCollection extends Mongo.Collection {
  insert(staticSlot, callback) {
    const ourStaticSlot = staticSlot;
    ourStaticSlot.createdAt = ourStaticSlot.createdAt || new Date();
    return super.insert(ourStaticSlot, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(staticSlot, callback) {
    return super.remove(staticSlot, callback);
  }
}

export const StaticSlots = new StaticSlotsCollection('StaticSlots');

// Deny all client-side updates since we will be using methods to manage this collection
StaticSlots.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


StaticSlots.schema = new SimpleSchema({
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
  slot_id: {
    type: String,
    label: 'Slot ID',
    regEx: SimpleSchema.RegEx.Id,
  },
  item_id: {
    type: String,
    label: 'Item ID',
    regEx: SimpleSchema.RegEx.Id,
  },
});

StaticSlots.attachSchema(StaticSlots.schema);

// This represents the keys from StaticSlots objects that should be published
// to the client. If we add secret properties to objects, don't list
// them here to keep them private to the server.
StaticSlots.publicFields = {
  _id: 1,
  created_at: 1,
  slot_id: 1,
  item_id: 1,
};

StaticSlots.helpers({

});
