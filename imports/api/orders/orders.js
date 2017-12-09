import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/factory';
import faker from 'faker';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// SimpleSchema.debug = true;

class OrdersCollection extends Mongo.Collection {
  insert(order, callback) {
    const ourOrder = order;
    ourOrder.createdAt = ourOrder.createdAt || new Date();
    const result = super.insert(ourOrder, callback);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }
  // remove(selector) {
  //   const orders = this.find(selector).fetch();
  //   const result = super.remove(selector);
  //   return result;
  // }
};

export const Orders = new OrdersCollection('Orders');

// Deny all client-side updates since we will be using methods to manage this collection
Orders.deny({
  insert() { return true; },
  update() { return true; },
  // remove() { return true; },
});

Customer = new SimpleSchema({
  first_name: { type: String },
  last_name: { type: String },
  phone: { 
    type: String,
    // regEx: "\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
    autoform: {
      afFieldInput: {
        type: "tel"
      }
    }
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Email address"
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
    optional: true
  },
  address_city: {
    type: String,
  },
  address_state: {
    type: String,
    // regEx: "[A-Za-z]{2}",
    allowedValues: [ "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY" ],
  },
  address_zipcode: {
    type: String,
  },
});

Orders.schema = new SimpleSchema({
  _id: {
    type: String,
    label: '_id',
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      type: "hidden"
    },
  },
  id: {
    type: Number,
    label: 'ID',
    optional: true,
  },
  userId: {
    type: String,
    label: 'User ID',
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      type: "hidden"
    },
    optional: true
  },
  customer: {
    type: Customer,
    optional: true
  },
  items: {
    type: [ String ],
    label: "Order Items",
    optional: true,
  },
  packName: {
    type: String,
    label: "Pack Name",
    optional: true
  },
  packPrice: {
    type: Number,
    label: "Pack Price"
  },
  salePrice: {
    type: String,
    label: "Subtotal",
    optional: true,
  },
  total: {
    type: String,
    label: "Total",
    optional: true,
  },
  packDishes: {
    type: [ String ],
    optional: true,
  },
  packSnacks: {
    type: [ String ],
    optional: true,
  },
  coupon: {
    type: String,
    label: "Promo Code",
    optional: true,
  },
  status: {
    type: String,
    label: "Status",
    allowedValues: ['pending', 'pending-sub', 'created', 'assigned', 'in_transit', 'delivered', 'cancelled', 'returned']
  },
  readyBy: {
    type: String,
    label: "Ready By",
    optional: true
  },
  deliveryWindow: {
    type: String,
    label: "Delivery Window",
    optional: true
  },
  destinationComments: {
    type: String,
    label: "Comments for delivery",
    optional: true
  },
  deliveredAt: {
    type: String,
    label: "Delivered at",
    optional: true
  },
  trackingCode: {
    type: String,
    label: "Tracking Code",
    optional: true
  },
  createdAt: {
    type: Date,
    label: "Created at",
    optional: true
  },
  paidAt: {
    type: Date,
    label: "Paid at",
    optional: true
  },
  deliv_id: {
    type: String,
    optional: true,
  },
  deliv_day: {
    type: String,
    optional: true,
  },
  stripe_id: {
    type: String,
    optional: true,
  }
});

Orders.attachSchema(Orders.schema);

// This represents the keys from Orders objects that should be published
// to the client. If we add secret properties to List objects, don't list
// them here to keep them private to the server.
Orders.publicFields = {
  _id: 1,
  id: 1,
  userId: 1,
  customer: 1,
  packName: 1,
  packPrice: 1,
  salePrice: 1,
  total: 1,
  packDishes: 1,
  packSnacks: 1,
  coupon: 1,
  status: 1,
  readyBy: 1,
  deliveryWindow: 1,
  destinationComments: 1,
  deliveredAt: 1,
  trackingCode: 1,
  createdAt: 1,
  paidAt: 1,
  deliv_id: 1,
  deliv_day: 1,
  stripe_id: 1,
};

// Factory.define('order', Orders, {
//   name: () => faker.lorem.words(),
//   photo: () => faker.image.food(),
//   description: () => faker.lorem.sentences(),
// });

Orders.helpers({

});

// for testing
// import { resetDatabase } from 'meteor/xolvio:cleaner';
// 
// describe('my module', function () {
//   beforeEach(function () {
//     resetDatabase();
//   });
// });