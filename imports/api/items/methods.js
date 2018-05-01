import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Check } from 'meteor/check';
import { 
  Items
} from './items.js';

export const insertItem = new ValidatedMethod({
  name: 'Meteor.insertItem',
  validate: new SimpleSchema({
    name: { type: String },
    category: { type: String, optional: true },
    subcategory: { type: String, optional: true },
    photo: { type: String, optional: true },
    description: { type: String, optional: true },
    ingredients: { type: [ String ], optional: true },
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
    sub_items: { type: [ String ], optional: true },
    'sub_items.$': { type: String, optional: true },
    inventory: { type: Number, optional: true },
    rank: { type: Number, optional: true },
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ name, category, subcategory, photo, description, ingredients, warnings, nutrition_facts, good_for_days, active, attributes, weight, dimensions, producer, cost_per_unit, price_per_unit, unit, sub_items, inventory, rank }) {

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
      nutrition_facts,
      good_for_days,
      active,
      attributes,
      comments: {},
      ratings: {},
      weight,
      dimensions,
      producer,
      cost_per_unit,
      price_per_unit,
      unit,
      sub_items,
      inventory,
      rank
    };

    Items.insert(item);

    // Create Stripe Product
    // Update Item with Product ID
  },
});

// export const editItem = new ValidatedMethod({
//   name: 'Items.methods.editItem',
//   validate: new SimpleSchema({
//     item_id: Items.simpleSchema().schema('_id')
//   }).validator({ clean: true, filter: false }),
//   run({ item_id, data }) {
//     const item = Items.findOne(item_id);

//     Items.update(item_id, { $set: {
//       active: newCheckedStatus,
//     } });
//   },
// });

// export const addToMenu = new ValidatedMethod({
//   name: 'Items.methods.addToMenu',
//   validate: new SimpleSchema({
//     item_id: Items.simpleSchema().schema('_id'),
//     menu_id: Menus.simpleSchema().schema('_id'),
//   }).validator({ clean: true, filter: false }),
//   run({ item_id, menu_id }) {
//     const item = Items.findOne(item_id);

//     Menus.update(menu_id, { $set: {
//       active: newCheckedStatus,
//     } });
//   },
// });

// export const toggleActive = new ValidatedMethod({
//   name: 'Items.methods.toggleActive',
//   validate: new SimpleSchema({
//     itemId: Items.simpleSchema().schema('_id'),
//     // newCheckedStatus: Items.simpleSchema().schema('active'),
//   }).validator({ clean: true, filter: false }),
//   run({ itemId }) {
//     const item = Items.findOne(itemId);

//     const newCheckedStatus = !(item.active);

//     // if (!item.editableBy(this.userId)) {
//     //   throw new Meteor.Error('items.setForThisWeek.accessDenied',
//     //     'Cannot edit checked status in the menu');
//     // }

//     Items.update(itemId, { $set: {
//       active: newCheckedStatus,
//     } });
//   },
// });

// export const orderItem = new ValidatedMethod({
//   name: 'Items.methods.orderItem',
//   validate: new SimpleSchema({
//     name: Items.simpleSchema().schema('name'),
//     // newCheckedStatus: Items.simpleSchema().schema('active'),
//   }).validator({ clean: true, filter: false }),
//   run({ name }) {
//     const item = Items.findOne({name: name});

//     const ordersThisWeek = item.ordersThisWeek + 1;
//     const ordersTotal = item.ordersTotal + 1;    

//     Items.update(item._id, { $set: {
//       ordersThisWeek: ordersThisWeek,
//       ordersTotal: ordersTotal,
//     } });
//   },
// });

// export const toggleInPack = new ValidatedMethod({
//   name: 'Items.methods.toggleInPack',
//   validate: new SimpleSchema({
//     itemId: Items.simpleSchema().schema('_id'), 
//     pack: { type: String },
//   }).validator({ clean: true, filter: false }),
//   run({ itemId, pack }) {
//     const item = Items.findOne(itemId);

//     var packOption = pack;
//     var newCheckedStatus = !(item.packs[pack]);

//     Items.update(itemId, { $set: {
//       ["packs." + packOption]: newCheckedStatus,
//     } });
//   },
// });

// export const updateText = new ValidatedMethod({
//   name: 'items.updateText',
//   validate: new SimpleSchema({
//     todoId: String },
//     newText: String },
//   }).validator(),
//   run({ todoId, newText }) {
//     // This is complex auth stuff - perhaps denormalizing a userId onto items
//     // would be correct here?
//     const todo = items.findOne(todoId);

//     if (!todo.editableBy(this.userId)) {
//       throw new Meteor.Error('items.updateText.accessDenied',
//         'Cannot edit items in a private list that is not yours');
//     }

//     items.update(todoId, {
//       $set: { text: newText },
//     });
//   },
// });

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
const Items_METHODS = _.pluck([
  insertItem,
  // editItem,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 items operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(Items_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
