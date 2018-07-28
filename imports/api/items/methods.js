import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Items } from './items.js';

export const insertItem = new ValidatedMethod({
  name: 'Meteor.insertItem',
  validate: new SimpleSchema({
    name: { type: String },
    category: { type: String, optional: true },
    subcategory: { type: String, optional: true },
    photo: { type: String, optional: true },
    description: { type: String, optional: true },
    ingredients: { type: [String], optional: true },
    'ingredients.$': { type: String, optional: true },
    warnings: { type: Object, optional: true },
    'warnings.peanuts': { type: Boolean, optional: true },
    'warnings.treenuts': { type: Boolean, optional: true },
    'warnings.fish': { type: Boolean, optional: true },
    'warnings.shellfish': { type: Boolean, optional: true },
    'warnings.beef': { type: Boolean, optional: true },
    'warnings.chicken': { type: Boolean, optional: true },
    'warnings.soy': { type: Boolean, optional: true },
    'warnings.wheat': { type: Boolean, optional: true },
    'warnings.milk': { type: Boolean, optional: true },
    'warnings.eggs': { type: Boolean, optional: true },
    nutrition_facts: { type: Object, optional: true },
    'nutrition_facts.servingSize': { type: String, optional: true },
    'nutrition_facts.calories': { type: String, optional: true },
    'nutrition_facts.totalFat': { type: String, optional: true },
    'nutrition_facts.saturatedFat': { type: String, optional: true },
    'nutrition_facts.transFat': { type: String, optional: true },
    'nutrition_facts.cholesterol': { type: String, optional: true },
    'nutrition_facts.sodium': { type: String, optional: true },
    'nutrition_facts.protein': { type: String, optional: true },
    'nutrition_facts.dietaryFiber': { type: String, optional: true },
    'nutrition_facts.sugars': { type: String, optional: true },
    'nutrition_facts.totalCarb': { type: String, optional: true },
    'nutrition_facts.PDV': { type: Object, optional: true },
    'nutrition_facts.PDV.vitaminA': { type: String, optional: true },
    'nutrition_facts.PDV.vitaminC': { type: String, optional: true },
    'nutrition_facts.PDV.calcium': { type: String, optional: true },
    'nutrition_facts.PDV.iron': { type: String, optional: true },
    good_for_days: { type: Number, optional: true },
    active: { type: Boolean },
    attributes: { type: Object, optional: true },
    'attributes.dairyFree': { type: Boolean, optional: true },
    'attributes.glutenFree': { type: Boolean, optional: true },
    'attributes.highProtein': { type: Boolean, optional: true },
    'attributes.paleo': { type: Boolean, optional: true },
    'attributes.vegan': { type: Boolean, optional: true },
    'attributes.vegetarian': { type: Boolean, optional: true },
    weight: { type: Number, optional: true },
    dimensions: { type: Number, optional: true },
    producer: { type: String, optional: true },
    cost_per_unit: { type: Number, decimal: true, optional: true },
    price_per_unit: { type: Number, decimal: true, optional: true },
    unit: { type: String, optional: true },
    sub_items: { type: [String], optional: true },
    'sub_items.$': { type: String, optional: true },
    inventory: { type: Number, optional: true },
    rank: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({
    name,
    category,
    subcategory,
    photo,
    description,
    ingredients,
    warnings,
    nutrition_facts: nutritionFacts,
    good_for_days: goodForDays,
    active,
    attributes,
    weight,
    dimensions,
    producer,
    cost_per_unit: costPerUnit,
    price_per_unit: pricePerUnit,
    unit,
    sub_items: subItems,
    inventory,
    rank,
  }) {
    const item = {
      user_id: Meteor.userId(),
      created_at: new Date(),
      name,
      category,
      subcategory,
      photo,
      description,
      ingredients,
      warnings,
      nutrition_facts: nutritionFacts,
      good_for_days: goodForDays,
      active,
      attributes,
      comments: {},
      ratings: {},
      weight,
      dimensions,
      producer,
      cost_per_unit: costPerUnit,
      price_per_unit: pricePerUnit,
      unit,
      sub_items: subItems,
      inventory,
      rank,
    };

    Items.insert(item);

    // Create Stripe Product
    // Update Item with Product ID
  },
});

export const remove = new ValidatedMethod({
  name: 'Items.methods.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Items.remove(_id);
  },
});

// Get list of all method names on items
const ITEMS_METHODS = _.pluck([
  insertItem,
  // editItem,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 items operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(ITEMS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
