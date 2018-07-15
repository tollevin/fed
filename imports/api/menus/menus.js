import { Mongo } from 'meteor/mongo';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
  Items,
} from '../items/items.js';

// SimpleSchema.debug = true;

class MenusCollection extends Mongo.Collection {
  insert(menu, callback) {
    const ourMenu = menu;
    const result = super.insert(ourMenu, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const menus = this.find(selector).fetch();
    const result = super.remove(selector);
    return result;
  }
}

export const Menus = new MenusCollection('Menus');

// Deny all client-side updates since we will be using methods to manage this collection
Menus.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Menus.schema = new SimpleSchema({
  _id: {
    type: String,
    label: 'ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoform: {
      type: 'hidden',
    },
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
  id_number: {
    type: Number,
    label: 'ID',
  },
  name: {
    type: String,
    label: 'Name',
  },
  items: {
    type: [Items],
    label: 'Items',
    optional: true,
  },
  // 'items.beef': {
  //   type: [ Items ],
  //   label: 'Beef Items',
  //   optional: true,
  // },
  // 'items.beef.$': {
  //   type: Items,
  //   label: 'Beef Item',
  //   optional: true,
  // },
  // 'items.chicken': {
  //   type: [ Items ],
  //   label: 'Chicken Items',
  //   optional: true,
  // },
  // 'items.chicken.$': {
  //   type: Items,
  //   label: 'Chicken Item',
  //   optional: true,
  // },
  // 'items.fish': {
  //   type: [ Items ],
  //   label: 'Fish Items',
  //   optional: true,
  // },
  // 'items.fish.$': {
  //   type: Items,
  //   label: 'Fish Item',
  //   optional: true,
  // },
  // 'items.soy': {
  //   type: [ Items ],
  //   label: 'Soy Items',
  //   optional: true,
  // },
  // 'items.soy.$': {
  //   type: Items,
  //   label: 'Soy Item',
  //   optional: true,
  // },
  // 'items.vegetable': {
  //   type: [ Items ],
  //   label: 'Vegetable Items',
  //   optional: true,
  // },
  // 'items.vegetable.$': {
  //   type: Items,
  //   label: 'Vegetable Item',
  //   optional: true,
  // },
  // 'items.grain': {
  //   type: [ Items ],
  //   label: 'Grain Items',
  //   optional: true,
  // },
  // 'items.grain.$': {
  //   type: Items,
  //   label: 'Grain Item',
  //   optional: true,
  // },
  // 'items.soup': {
  //   type: [ Items ],
  //   label: 'Soup Items',
  //   optional: true,
  // },
  // 'items.soup.$': {
  //   type: Items,
  //   label: 'Soup Item',
  //   optional: true,
  // },
  // 'items.salad': {
  //   type: [ Items ],
  //   label: 'Salad Items',
  //   optional: true,
  // },
  // 'items.salad.$': {
  //   type: Items,
  //   label: 'Salad Item',
  //   optional: true,
  // },
  // 'items.packs': {
  //   type: [ Items ],
  //   label: 'Pack Items',
  //   optional: true,
  // },
  // 'items.packs.$': {
  //   type: Items,
  //   label: 'Pack Item',
  //   optional: true,
  // },
  online_at: {
    type: Date,
    label: 'Online At',
    optional: true,
  },
  custom_until: {
    type: Date,
    label: 'Customizable Until',
    optional: true,
  },
  offline_at: {
    type: Date,
    label: 'Offline At',
    optional: true,
  },
  ready_by: {
    type: Date,
    label: 'Ready By',
    optional: true,
  },
  delivery_windows: {
    type: [String],
    label: 'Delivery Windows',
    optional: true,
  },
  active: {
    type: Boolean,
    label: 'Active',
    optional: true,
  },
});

Menus.attachSchema(Menus.schema);

// This represents the keys from Menus objects that should be published
// to the client. If we add secret properties to Menu objects, don't list
// them here to keep them private to the server.
Menus.publicFields = {
  _id: 1,
  id_number: 1,
  name: 1,
  items: 1,
  online_at: 1,
  custom_until: 1,
  offline_at: 1,
  ready_by: 1,
  delivery_windows: 1,
};

Menus.helpers({
  items: () => Items.find({ _id: { $in: this.items } }),
});
