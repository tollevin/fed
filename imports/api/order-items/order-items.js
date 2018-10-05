import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class OrderItemsCollection extends Mongo.Collection {
  insert(orderItem, callback) {
    const ourOrderItem = orderItem;
    ourOrderItem.createdAt = ourOrderItem.createdAt || new Date();
    return super.insert(ourOrderItem, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(selector) {
    return super.remove(selector);
  }
}

export const OrderItems = new OrderItemsCollection('OrderItems');

// Deny all client-side updates since we will be using methods to manage this collection
OrderItems.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


OrderItems.schema = new SimpleSchema({
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
  week_of: {
    type: Date,
    label: 'Week of (SUN)',
  },
  user_id: {
    type: String,
    label: 'User ID',
    regEx: SimpleSchema.RegEx.Id,
  },
  slot_id: {
    type: String,
    label: 'Slot ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  item_id: {
    type: String,
    label: 'Item ID',
    regEx: SimpleSchema.RegEx.Id,
  },
  order_id: {
    type: String,
    label: 'Order ID',
    regEx: SimpleSchema.RegEx.Id,
  },
  editor: {
    type: String,
    label: 'Editor',
    optional: true,
  },
});

OrderItems.attachSchema(OrderItems.schema);

// This represents the keys from OrderItems objects that should be published
// to the client. If we add secret properties to objects, don't list
// them here to keep them private to the server.
OrderItems.publicFields = {
  _id: 1,
  created_at: 1,
  week_of: 1,
  user_id: 1,
  item_id: 1,
  slot_id: 1,
  order_id: 1,
  editor: 1,
};

OrderItems.helpers({

});
