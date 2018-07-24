import { Mongo } from 'meteor/mongo';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// SimpleSchema.debug = true;

class PromosCollection extends Mongo.Collection {
  insert(promo, callback) {
    return super.insert(promo, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(selector) {
    return super.remove(selector);
  }
}

export const Promos = new PromosCollection('Promos');

// Deny all client-side updates since we will be using methods to manage this collection
Promos.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Promos.schema = new SimpleSchema({
  _id: {
    type: String,
    label: 'ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  createdAt: {
    type: Date,
    label: 'Created at',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  code: {
    type: String,
    label: 'code',
  },
  // type: {
  //   type: String,
  //   label: "type"
  // },
  desc: {
    type: String,
    label: 'Description',
  },
  credit: {
    type: Number,
    label: 'Credit ($)',
    optional: true,
  },
  percentage: {
    type: Number,
    label: 'Percent Off',
    optional: true,
  },
  function: {
    type: Function,
    label: 'Function',
    optional: true,
  },
  expires: {
    type: String,
    label: 'Expires At',
    optional: true,
  },
  useLimitPerCustomer: {
    type: Number,
    label: 'Number of allowed uses per customer',
    defaultValue: 1,
  },
  useLimitTotal: {
    type: Number,
    label: 'Number of allowed uses in total',
    defaultValue: 1,
    optional: true,
  },
  timesUsed: {
    type: Number,
    label: 'Number of times used',
    defaultValue: 0,
    autoform: {
      type: 'hidden',
    },
  },
  users: {
    type: Object,
    label: 'Users',
    blackbox: true,
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  orders: {
    type: Object,
    label: 'Orders',
    blackbox: true,
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  active: {
    type: Boolean,
    label: 'Active',
    defaultValue: true,
  },
});

Promos.attachSchema(Promos.schema);

// This represents the keys from Promos objects that should be published
// to the client. If we add secret properties to Promo objects, don't list
// them here to keep them private to the server.
Promos.publicFields = {
  _id: 1,
  createdAt: 1,
  code: 1,
  desc: 1,
  discount: 1,
  percentage: 1,
  expires: 1,
  useLimitPerCustomer: 1,
  useLimitTotal: 1,
  timesUsed: 1,
  users: 1,
  active: 1,
};

Promos.helpers({

});
