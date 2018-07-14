import { Mongo } from 'meteor/mongo';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// SimpleSchema.debug = true;

class DeliveryWindowsCollection extends Mongo.Collection {
  insert(dw, callback) {
    const deliveryWindow = dw;
    deliveryWindow.created_at = deliveryWindow.created_at || new Date();
    const result = super.insert(deliveryWindow, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const result = super.remove(selector);
    return result;
  }
}

export default DeliveryWindows = new DeliveryWindowsCollection('DeliveryWindows');

// Deny all client-side updates since we will be using methods to manage this collection
DeliveryWindows.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

DeliveryWindows.schema = new SimpleSchema({
  _id: {
    type: String,
    label: 'ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  created_at: {
    type: Date,
    label: 'Created At',
    // autoValue: function () {
    //   return new Date()
    // },
    denyUpdate: true,
    autoform: {
      type: 'hidden',
    },
  },
  delivery_start_time: {
    type: Date,
    label: 'Delivery Start',
  },
  delivery_end_time: {
    type: Date,
    label: 'Delivery End',
  },
  delivery_day: {
    type: String,
    label: 'Delivery Day',
  },
});

DeliveryWindows.attachSchema(DeliveryWindows.schema);

// This represents the keys from DeliveryWindows objects that should be published
// to the client. If we add secret properties, don't list
// them here to keep them private to the server.
DeliveryWindows.publicFields = {
  _id: 1,
  created_at: 1,
  delivery_start_time: 1,
  delivery_end_time: 1,
};
