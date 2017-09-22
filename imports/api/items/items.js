import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/factory';
import faker from 'faker';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// SimpleSchema.debug = true;

class ItemsCollection extends Mongo.Collection {
  insert(item, callback) {
    const ourItem = item;
    ourItem.createdAt = ourItem.createdAt || new Date();
    const result = super.insert(ourItem, callback);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }
  remove(selector) {
    const items = this.find(selector).fetch();
    const result = super.remove(selector);
    return result;
  }
};

export const Items = new ItemsCollection('Items');

// Deny all client-side updates since we will be using methods to manage this collection
Items.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Ingredient = new SimpleSchema({
  name: { type: String },
  subIngredients: { type: String, optional: true },
  // brand: { type: String, optional: true },
  // amount: { type: Number, optional: true },
  // amountUnit: { type: String, optional: true },
  // supplier: { type: String, optional: true },
  // allergen: { type: String, optional: true },
})

Items.schema = new SimpleSchema({
  _id: {
    type: String,
    label: 'ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoform: {
      type: "hidden"
    }
  },
  name: {
    type: String,
    label: "Name"
  },
  course: {
    type: String,
    label: "Course",
    allowedValues: ['Dish','Snack'],
    optional: true
  },
  photo: {
    type: String,
    label: 'Photo',
    optional: true,
    autoform: {
      afFieldInput: {
        type: "url"
      }
    } 
  },
  userId: {
    type: String,
    label: 'User ID',
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoform: {
      type: "hidden"
    }
  },
  description: {
    type: String,
    label: "Description",
    autoform: {
      afFieldInput: {
        type: "textarea",
        rows: 2,
        class: "text-input"
      }
    }
  },
  ingredients: {
    type: [ String ],
    label: 'Ingredients',
    optional: true
  },
  warnings: {
    type: Object,
    label: 'Contains',
    optional: true
  },
  "warnings.milk": {
    type: Boolean,
    label: 'Milk',
    optional: true,
  },
  "warnings.peanuts": {
    type: Boolean,
    label: 'Peanuts',
    optional: true,
  },
  "warnings.treenuts": {
    type: Boolean,
    label: 'Tree Nuts',
    optional: true,
  },
  "warnings.fish": {
    type: Boolean,
    label: 'Fish',
    optional: true,
  },
  "warnings.shellfish": {
    type: Boolean,
    label: 'Shellfish',
    optional: true,
  },
  "warnings.eggs": {
    type: Boolean,
    label: 'Eggs',
    optional: true,
  },
  "warnings.beef": {
    type: Boolean,
    label: 'Beef',
    optional: true,
  },
  "warnings.chicken": {
    type: Boolean,
    label: 'Chicken',
    optional: true,
  },
  "warnings.soy": {
    type: Boolean,
    label: 'Soy',
    optional: true,
  },
  "warnings.wheat": {
    type: Boolean,
    label: 'Wheat',
    optional: true,
  },
  goodFor_Days: {
    type: Number,
    label: 'Good for X days',
    optional: true
  },
  createdAt: {
    type: Date,
    label: 'Created At',
    // autoValue: function () {
    //   return new Date()
    // },
    denyUpdate: true,
    autoform: {
      type: "hidden"
    }
  },
  active: {
    type: Boolean,
    label: 'This week?',
    optional: true,
  },
  packs: {
    type: Object,
    label: 'Packs',
    optional: true,
  },
  "packs.omnivorePack": {
    type: Boolean,
    label: 'Omnivore Pack',
    optional: true,
  },
  "packs.vegetarianPack": {
    type: Boolean,
    label: 'Vegetarian Pack',
    optional: true,
  },
  nutritionFacts: {
    type: Object,
    label: 'Nutrition Facts',
    optional: true,
  },
  "nutritionFacts.servingSize": {
    type: String,
    label: 'Serving Size (g)',
    optional: true,
  },
  "nutritionFacts.calories": {
    type: String,
    label: 'Calories',
    optional: true,
  },
  "nutritionFacts.totalFat": {
    type: String,
    label: 'Total Fat (g)',
    optional: true,
  },
  "nutritionFacts.saturatedFat": {
    type: String,
    label: 'Saturated Fat (g)',
    optional: true,
  },
  "nutritionFacts.transFat": {
    type: String,
    label: 'Trans Fat (g)',
    optional: true,
  },
  "nutritionFacts.cholesterol": {
    type: String,
    label: 'Cholesterol (mg)',
    optional: true,
  },
  "nutritionFacts.sodium": {
    type: String,
    label: 'Sodium (mg)',
    optional: true,
  },
  "nutritionFacts.protein": {
    type: String,
    label: 'Protein (g)',
    optional: true,
  },
  "nutritionFacts.totalCarb": {
    type: String,
    label: 'Total Carbs (g)',
    optional: true,
  },
  "nutritionFacts.dietaryFiber": {
    type: String,
    label: 'Dietary Fiber (g)',
    optional: true,
  },
  "nutritionFacts.sugars": {
    type: String,
    label: 'Sugars (g)',
    optional: true,
  },
  "nutritionFacts.PDV": {
    type: Object,
    label: 'PDVs',
    optional: true,
  },
  "nutritionFacts.PDV.vitaminA": {
    type: String,
    label: 'Vitamin A (%DV)',
    optional: true,
  },
  "nutritionFacts.PDV.vitaminC": {
    type: String,
    label: 'Vitamin C (%DV)',
    optional: true,
  },
  "nutritionFacts.PDV.calcium": {
    type: String,
    label: 'Calcium (%DV)',
    optional: true,
  },
  "nutritionFacts.PDV.iron": {
    type: String,
    label: 'Iron (%DV)',
    optional: true,
  },
  attributes: {
    type: Object,
    label: 'Attributes',
    optional: true,
  },
  "attributes.dairyFree": {
    type: Boolean,
    label: 'Dairy Free',
    optional: true,
  },
  "attributes.glutenFree": {
    type: Boolean,
    label: 'Gluten Free',
    optional: true,
  },
  "attributes.highProtein": {
    type: Boolean,
    label: 'High Protein',
    optional: true,
  },
  "attributes.paleo": {
    type: Boolean,
    label: 'Paleo',
    optional: true,
  },
  "attributes.vegan": {
    type: Boolean,
    label: 'Vegan',
    optional: true,
  },
  "attributes.vegetarian": {
    type: Boolean,
    label: 'Vegetarian',
    optional: true,
  },
  comments: {
    type: Object,
    label: "Comments",
    optional: true,
    autoform: {
      type: "hidden"
    }
  },
  ratings: {
    type: Object,
    label: "Ratings",
    optional: true,
    autoform: {
      type: "hidden"
    }
  },
  weight: {
    type: Number,
    label: "Weight",
    optional: true,
  },
  ordersThisWeek: {
    type: Number,
    label: "Orders This Week",
    optional: true,
    autoform: {
      type: "hidden"
    }
  },
  ordersTotal: {
    type: Number,
    label: "Total Orders",
    optional: true,
    autoform: {
      type: "hidden"
    }
  }
});

Items.attachSchema(Items.schema);

// This represents the keys from Items objects that should be published
// to the client. If we add secret properties to Item objects, don't list
// them here to keep them private to the server.
Items.publicFields = {
  _id: 1,
  name: 1,
  course: 1,
  photo: 1,
  description: 1,
  ingredients: 1,
  warnings: 1,
  packs: 1,
  nutritionFacts: 1,
  goodFor_Days: 1,
  active: 1,
  attributes: 1,
  comments: 1,
  ratings: 1,
  weight: 1,
  ordersThisWeek: 1,
  ordersTotal:1,
};

Factory.define('item', Items, {
  name: () => faker.lorem.words(),
  photo: () => faker.image.food(),
  description: () => faker.lorem.sentences(),
});

Items.helpers({

});

// for testing
// import { resetDatabase } from 'meteor/xolvio:cleaner';
// 
// describe('my module', function () {
//   beforeEach(function () {
//     resetDatabase();
//   });
// });
// const chicken = Factory.create('item');
// const cheese = Factory.create('item');
// const chai = Factory.create('item');