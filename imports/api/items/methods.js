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
    course: { type: String, optional: true },
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
    goodFor_Days: { type: Number, optional: true },
    active: { type: Boolean, optional: true },
    packs: { type: Object, optional: true },
    'packs.omnivorePack': { type: Boolean, optional: true },
    'packs.vegetarianPack': { type: Boolean, optional: true },
    nutritionFacts: { type: Object, optional: true },
    'nutritionFacts.servingSize': { type: String, optional: true },
    'nutritionFacts.calories': { type: String, optional: true },
    'nutritionFacts.totalFat': { type: String, optional: true },
    'nutritionFacts.saturatedFat': { type: String, optional: true },
    'nutritionFacts.transFat': { type: String, optional: true },
    'nutritionFacts.cholesterol': { type: String, optional: true },
    'nutritionFacts.sodium': { type: String, optional: true },
    'nutritionFacts.protein': { type: String, optional: true },
    'nutritionFacts.dietaryFiber': { type: String, optional: true },
    'nutritionFacts.sugars': { type: String, optional: true },
    'nutritionFacts.totalCarb': { type: String, optional: true },
    'nutritionFacts.PDV': { type: Object, optional: true },
    'nutritionFacts.PDV.vitaminA': { type: String, optional: true },
    'nutritionFacts.PDV.vitaminC': { type: String, optional: true },
    'nutritionFacts.PDV.calcium': { type: String, optional: true },
    'nutritionFacts.PDV.iron': { type: String, optional: true },
    attributes: { type: Object, optional: true },
    'attributes.dairyFree': { type: Boolean, optional: true },
    'attributes.glutenFree': { type: Boolean, optional: true },
    'attributes.highProtein': { type: Boolean, optional: true },
    'attributes.paleo': { type: Boolean, optional: true },
    'attributes.vegan': { type: Boolean, optional: true },
    'attributes.vegetarian': { type: Boolean, optional: true },
    weight: { type: Number, optional: true }
  }).validator({ clean: true, filter: false }),
  applyOptions: {
    noRetry: true,
  },
  run({ name, course, photo, description, ingredients, warnings, goodFor_Days, active, packs, nutritionFacts, attributes, weight }) {

    const item = {
      name,
      course,
      description,
      createdAt: new Date(),
      userId: Meteor.userId(),
      ingredients,
      warnings,
      photo,
      goodFor_Days,
      active,
      packs,
      nutritionFacts,
      attributes,
      weight,
      ordersThisWeek: 0,
      ordersTotal: 0,
    };

    Items.insert(item);
  },
});

export const toggleActive = new ValidatedMethod({
  name: 'Items.methods.toggleActive',
  validate: new SimpleSchema({
    itemId: Items.simpleSchema().schema('_id'),
    // newCheckedStatus: Items.simpleSchema().schema('active'),
  }).validator({ clean: true, filter: false }),
  run({ itemId }) {
    const item = Items.findOne(itemId);

    const newCheckedStatus = !(item.active);

    // if (!item.editableBy(this.userId)) {
    //   throw new Meteor.Error('items.setForThisWeek.accessDenied',
    //     'Cannot edit checked status in the menu');
    // }

    Items.update(itemId, { $set: {
      active: newCheckedStatus,
    } });
  },
});

export const orderItem = new ValidatedMethod({
  name: 'Items.methods.orderItem',
  validate: new SimpleSchema({
    name: Items.simpleSchema().schema('name'),
    // newCheckedStatus: Items.simpleSchema().schema('active'),
  }).validator({ clean: true, filter: false }),
  run({ name }) {
    const item = Items.findOne({name: name});

    const ordersThisWeek = item.ordersThisWeek + 1;
    const ordersTotal = item.ordersTotal + 1;    

    Items.update(item._id, { $set: {
      ordersThisWeek: ordersThisWeek,
      ordersTotal: ordersTotal,
    } });
  },
});

export const toggleInPack = new ValidatedMethod({
  name: 'Items.methods.toggleInPack',
  validate: new SimpleSchema({
    itemId: Items.simpleSchema().schema('_id'), 
    pack: { type: String },
  }).validator({ clean: true, filter: false }),
  run({ itemId, pack }) {
    const item = Items.findOne(itemId);

    var packOption = pack;
    var newCheckedStatus = !(item.packs[pack]);

    Items.update(itemId, { $set: {
      ["packs." + packOption]: newCheckedStatus,
    } });
  },
});
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
  toggleActive,
  toggleInPack,
  orderItem,
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
