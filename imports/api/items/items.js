import { Mongo } from 'meteor/mongo';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Plans } from '../plans/plans.js';

// SimpleSchema.debug = true;

class ItemsCollection extends Mongo.Collection {
  insert(item, callback) {
    const ourItem = item;
    ourItem.created_at = ourItem.created_at || new Date();
    return super.insert(ourItem, callback);
  }

  update(selector, modifier) {
    return super.update(selector, modifier);
  }

  remove(selector) {
    return super.remove(selector);
  }
}

export const Items = new ItemsCollection('Items');

// Deny all client-side updates since we will be using methods to manage this collection
Items.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Items.schema = new SimpleSchema({
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
  name: {
    type: String,
    label: 'Name',
  },
  category: {
    type: String,
    label: 'Category',
    allowedValues: ['Meal', 'Plate', 'Breakfast', 'Snack', 'Drink', 'Grocery', 'Condiment', 'Pack', 'Miscellaneous'],
  },
  subcategory: {
    type: String,
    label: 'Subcategory',
    optional: true,
  },
  photo: {
    type: String,
    label: 'Photo',
    optional: true,
    autoform: {
      afFieldInput: {
        type: 'url',
      },
    },
  },
  user_id: {
    type: String,
    label: 'User ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  sku: {
    type: String,
    label: 'SKU',
    optional: true,
  },
  plans: {
    type: Object,
    label: 'Plans',
    optional: true,
    blackbox: true,
    autoform: {
      autoform: {
        type: 'hidden',
      },
    },
  },
  description: {
    type: String,
    label: 'Description',
    autoform: {
      afFieldInput: {
        type: 'textarea',
        rows: 2,
        class: 'text-input',
      },
    },
  },
  ingredients: {
    type: [String],
    label: 'Ingredients',
    optional: true,
  },
  warnings: {
    type: Object,
    label: 'Contains',
    optional: true,
  },
  'warnings.milk': {
    type: Boolean,
    label: 'Milk',
    optional: true,
  },
  'warnings.peanuts': {
    type: Boolean,
    label: 'Peanuts',
    optional: true,
  },
  'warnings.treenuts': {
    type: Boolean,
    label: 'Tree Nuts',
    optional: true,
  },
  'warnings.fish': {
    type: Boolean,
    label: 'Fish',
    optional: true,
  },
  'warnings.shellfish': {
    type: Boolean,
    label: 'Shellfish',
    optional: true,
  },
  'warnings.eggs': {
    type: Boolean,
    label: 'Eggs',
    optional: true,
  },
  'warnings.beef': {
    type: Boolean,
    label: 'Beef',
    optional: true,
  },
  'warnings.chicken': {
    type: Boolean,
    label: 'Chicken',
    optional: true,
  },
  'warnings.soy': {
    type: Boolean,
    label: 'Soy',
    optional: true,
  },
  'warnings.wheat': {
    type: Boolean,
    label: 'Wheat',
    optional: true,
  },
  good_for_days: {
    type: Number,
    label: 'Good for X days',
    optional: true,
  },
  active: {
    type: Boolean,
    label: 'This week?',
    optional: true,
  },
  nutrition_facts: {
    type: Object,
    label: 'Nutrition Facts',
    optional: true,
  },
  'nutrition_facts.servingSize': {
    type: String,
    label: 'Serving Size (g)',
    optional: true,
  },
  'nutrition_facts.calories': {
    type: String,
    label: 'Calories',
    optional: true,
  },
  'nutrition_facts.totalFat': {
    type: String,
    label: 'Total Fat (g)',
    optional: true,
  },
  'nutrition_facts.saturatedFat': {
    type: String,
    label: 'Saturated Fat (g)',
    optional: true,
  },
  'nutrition_facts.transFat': {
    type: String,
    label: 'Trans Fat (g)',
    optional: true,
  },
  'nutrition_facts.cholesterol': {
    type: String,
    label: 'Cholesterol (mg)',
    optional: true,
  },
  'nutrition_facts.sodium': {
    type: String,
    label: 'Sodium (mg)',
    optional: true,
  },
  'nutrition_facts.protein': {
    type: String,
    label: 'Protein (g)',
    optional: true,
  },
  'nutrition_facts.totalCarb': {
    type: String,
    label: 'Total Carbs (g)',
    optional: true,
  },
  'nutrition_facts.dietaryFiber': {
    type: String,
    label: 'Dietary Fiber (g)',
    optional: true,
  },
  'nutrition_facts.sugars': {
    type: String,
    label: 'Sugars (g)',
    optional: true,
  },
  'nutrition_facts.PDV': {
    type: Object,
    label: 'PDVs',
    optional: true,
  },
  'nutrition_facts.PDV.vitaminA': {
    type: String,
    label: 'Vitamin A (%DV)',
    optional: true,
  },
  'nutrition_facts.PDV.vitaminC': {
    type: String,
    label: 'Vitamin C (%DV)',
    optional: true,
  },
  'nutrition_facts.PDV.calcium': {
    type: String,
    label: 'Calcium (%DV)',
    optional: true,
  },
  'nutrition_facts.PDV.iron': {
    type: String,
    label: 'Iron (%DV)',
    optional: true,
  },
  attributes: {
    type: Object,
    label: 'Attributes',
    optional: true,
  },
  'attributes.dairyFree': {
    type: Boolean,
    label: 'Dairy Free',
    optional: true,
  },
  'attributes.glutenFree': {
    type: Boolean,
    label: 'Gluten Free',
    optional: true,
  },
  // "attributes.highProtein": {
  //   type: Boolean,
  //   label: 'High Protein',
  //   optional: true,
  // },
  'attributes.paleo': {
    type: Boolean,
    label: 'Paleo',
    optional: true,
  },
  'attributes.vegan': {
    type: Boolean,
    label: 'Vegan',
    optional: true,
  },
  'attributes.vegetarian': {
    type: Boolean,
    label: 'Vegetarian',
    optional: true,
  },
  comments: {
    type: Object,
    label: 'Comments',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  ratings: {
    type: Object,
    label: 'Ratings',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  weight: {
    type: Number,
    decimal: true,
    label: 'Weight in Lbs',
    optional: true,
  },
  dimensions: {
    type: String,
    label: 'Dimensions',
    optional: true,
  },
  producer: {
    type: String,
    label: 'Producer',
    optional: true,
  },
  cost_per_unit: {
    type: Number,
    decimal: true,
    label: 'Cost per unit',
    optional: true,
  },
  price_per_unit: {
    type: Number,
    decimal: true,
    label: 'Price per unit',
    optional: true,
  },
  unit: {
    type: String,
    label: 'Unit',
    optional: true,
  },
  sub_items: {
    type: Object,
    label: 'Sub-Items',
    optional: true,
  },
  'sub_items.schema': {
    type: Object,
    label: 'Sub-Items Schema',
    optional: true,
    blackbox: true,
    autoform: {
      type: 'hidden',
    },
  },
  'sub_items.items': {
    type: [String],
    label: 'Sub-Items Items',
    optional: true,
  },
  inventory: {
    type: Number,
    label: 'Inventory',
    optional: true,
  },
  rank: {
    type: Number,
    label: 'Menu Rank',
    optional: true,
  },
});

Items.attachSchema(Items.schema);

// This represents the keys from Items objects that should be published
// to the client. If we add secret properties to Item objects, don't list
// them here to keep them private to the server.
Items.publicFields = {
  _id: 1,
  user_id: 1,
  created_at: 1,
  name: 1,
  category: 1,
  subcategory: 1,
  photo: 1,
  stripe_product_id: 1,
  stripe_plans: 1,
  description: 1,
  ingredients: 1,
  warnings: 1,
  nutrition_facts: 1,
  good_for_days: 1,
  active: 1,
  attributes: 1,
  comments: 1,
  ratings: 1,
  weight: 1,
  dimensions: 1,
  producer: 1,
  cost_per_unit: 1,
  price_per_unit: 1,
  unit: 1,
  sub_items: 1,
  inventory: 1,
  rank: 1,
};

Items.helpers({
  plans(data) {
    return Plans.findOne({
      item_id: data.item_id,
      frequency: data.frequency,
      quantity: data.quantity,
    });
  },
});
