import { Mongo } from 'meteor/mongo';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class OrdersCollection extends Mongo.Collection {
  insert(order, callback) {
    const ourOrder = order;
    ourOrder.createdAt = ourOrder.createdAt || new Date();
    return super.insert(ourOrder, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }
  // No remove -- Orders should only be updated
}

export const Orders = new OrdersCollection('Orders');

// Deny all client-side updates since we will be using methods to manage this collection
Orders.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const Recipient = new SimpleSchema({
  first_name: { type: String },
  last_name: { type: String },
  phone: {
    type: String,
    // regEx: "\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
    autoform: {
      afFieldInput: {
        type: 'tel',
      },
    },
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: 'Email address',
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
    optional: true,
  },
  address_city: {
    type: String,
  },
  address_state: {
    type: String,
    // regEx: "[A-Za-z]{2}",
    allowedValues: ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'],
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
      type: 'hidden',
    },
  },
  created_at: {
    type: Date,
    label: 'Created at',
    optional: true,
  },
  id_number: {
    type: Number,
    label: 'ID Number',
    optional: true,
  },
  week_of: {
    type: Date,
    label: 'Week of',
  },
  status: {
    type: String,
    label: 'Status',
    allowedValues: ['skipped', 'pending', 'pending-sub', 'custom-sub', 'created', 'canceled', 'assigned', 'in_transit', 'delivered', 'rejected', 'returned', 'lost'],
  },
  style: {
    type: String,
    label: 'Style',
    optional: true,
  },
  user_id: {
    type: String,
    label: 'User ID',
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  menu_id: {
    type: String,
    label: 'Menu ID',
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  recipient: {
    type: Recipient,
    optional: true,
  },
  gift: {
    type: Boolean,
    optional: true,
  },
  items: {
    type: [Object],
    label: 'Order Items',
    optional: true,
  },
  'items.$': {
    type: Object,
    label: 'Order Item',
    blackbox: true,
    optional: true,
  },
  subscriptions: {
    type: [Object],
    label: 'Order Subscriptions',
    optional: true,
  },
  'subscriptions.$': {
    type: Object,
    label: 'Order Subscription',
    blackbox: true,
    optional: true,
  },
  subtotal: {
    type: Number,
    decimal: true,
    label: 'Subtotal',
    optional: true,
  },
  discount: {
    type: Object,
    label: 'Discount',
    optional: true,
  },
  'discount.subscriber_discounts': {
    type: [Object],
    label: 'Subscriber Discounts',
    optional: true,
  },
  'discount.subscriber_discounts.$': {
    type: Object,
    label: 'Subscriber Discount Code',
    optional: true,
  },
  'discount.subscriber_discounts.$.item_id': {
    type: String,
    label: 'Subscription Item',
    optional: true,
  },
  'discount.subscriber_discounts.$.percent_off': {
    type: String,
    label: 'Subscription Item',
    optional: true,
  },
  'discount.subscriber_discounts.$.value': {
    type: String,
    label: 'Subscription Item',
    optional: true,
  },
  'discount.promo': {
    type: Object,
    label: 'Promotion',
    optional: true,
  },
  'discount.promo.type': {
    type: String,
    label: 'Promotion Type',
    optional: true,
  },
  'discount.promo.code': {
    type: String,
    label: 'Promotion Code',
    optional: true,
  },
  'discount.promo.description': {
    type: String,
    label: 'Promotion Description',
    optional: true,
  },
  'discount.promo.value': {
    type: Number,
    decimal: true,
    label: 'Promotion Discount Value',
    optional: true,
  },
  'discount.credit': {
    type: Number,
    decimal: true,
    label: 'Account Credit Used',
    optional: true,
  },
  'discount.value': {
    type: Number,
    decimal: true,
    label: 'Discount Value',
    optional: true,
  },
  delivery_fee: {
    type: Number,
    decimal: true,
    label: 'Delivery Fee',
    optional: true,
  },
  sales_tax: {
    type: Number,
    decimal: true,
    label: 'Sales Tax',
    optional: true,
  },
  total: {
    type: Number,
    decimal: true,
    label: 'Total Price',
    optional: true,
  },
  payment_id: {
    type: String,
    optional: true,
  },
  paid_at: {
    type: Date,
    label: 'Paid at',
    optional: true,
  },
  ready_by: {
    type: Date,
    label: 'Ready By',
    optional: true,
  },
  delivery_window_id: {
    type: String,
    label: 'Delivery Window',
    optional: true,
  },
  delivery_comments: {
    type: String,
    label: 'Comments for delivery',
    optional: true,
  },
  tracking_code: {
    type: String,
    label: 'Tracking Code',
    optional: true,
  },
  courier: {
    type: String,
    label: 'Courier',
    optional: true,
  },
  delivered_at: {
    type: Date,
    label: 'Delivered at',
    optional: true,
  },
  notes: {
    type: String,
    label: 'Notes',
    optional: true,
  },
  changes: {
    type: Object,
    label: 'Changes Made',
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  'changes.removed': {
    type: [String],
    label: 'Items Removed',
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  'changes.removed.$': {
    type: String,
    label: 'Removed Item',
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  'changes.added': {
    type: [String],
    label: 'Items Added',
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  'changes.added.$': {
    type: String,
    label: 'Added Item',
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
  auto_correct: {
    type: Number,
    label: 'Automation Score',
    autoform: {
      type: 'hidden',
    },
    optional: true,
  },
});

export const hasMadePurchase = userId => !!Orders.findOne({
  user_id: userId,
  status: {$ne: 'pending'},
});

Orders.attachSchema(Orders.schema);

// This represents the keys from Orders objects that should be published
// to the client. If we add secret properties to objects, don't list
// them here to keep them private to the server.
Orders.publicFields = {
  _id: 1,
  created_at: 1,
  id_number: 1,
  week_of: 1,
  status: 1,
  user_id: 1,
  menu_id: 1,
  recipient: 1,
  gift: 1,
  items: 1,
  subscriptions: 1,
  subtotal: 1,
  discount: 1,
  delivery_fee: 1,
  sales_tax: 1,
  total: 1,
  payment_id: 1,
  paid_at: 1,
  ready_by: 1,
  delivery_window_id: 1,
  delivery_comments: 1,
  tracking_code: 1,
  courier: 1,
  delivered_at: 1,
  notes: 1,
  changes: 1,
  auto_correct: 1,
};

Orders.helpers({

});
