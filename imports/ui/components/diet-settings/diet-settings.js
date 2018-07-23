import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
// import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// import { Session } from 'meteor/session';
// import { Tracker } from 'meteor/tracker';

import {
  ALL_FOODS, VEGETARIAN_FOODS, VEGAN_FOODS, PESCATARIAN_FOODS, PALEO_FOODS,
}
  from '/imports/ui/lib/pack_picker/diet_food_restrictions.js';
import { RESTRICTION_TO_ITEM_RESTRICTION } from '/imports/ui/lib/pack_picker/pack_planner.js';

import './diet-settings.less';
import './diet-settings.html';

Template.Diet_settings.onCreated(function dietSettingsOnCreated() {
  // const user = Meteor.user();
  // this.plan = new ReactiveVar(Meteor.user().subscriptions.plan.id);
  this.diet = new ReactiveVar(Meteor.user().diet);
  this.restrictions = new ReactiveVar(Meteor.user().restrictions);
  this.deliveryDay = new ReactiveVar(Meteor.user().preferredDelivDay);
});

Template.Diet_settings.onRendered(function dietSettingsOnRendered() {
  // var restrictions = template.findAll('.checked');
  // formdata.restrictions = [];
  // for (var i = restrictions.length - 1; i >= 0; i--) {
  //   formdata.restrictions.push(restrictions[i].id);
  // };
  // const user = formdata;
  console.log(this.diet.get());
});

Template.Diet_settings.helpers({
  diets: () => {
    const diets = ['Omnivore', 'Vegetarian', 'Vegan', 'Pescetarian', 'Paleo'];
    return diets;
  },

  restrictions: () => {
    const allRestrictions = ['beef', 'chicken', 'fish', 'shellfish', 'eggs', 'dairy', 'nuts', 'peanuts', 'soy', 'gluten'];
    return allRestrictions;
  },

  activeDiet: diet => diet,
});

Template.Diet_settings.events({
  'click .diet label, touchstart .diet label'(event, template) {
    event.preventDefault();

    const diets = template.findAll('.diet > label');
    for (let i = diets.length - 1; i >= 0; i--) {
      diets[i].classList.remove('clicked');
    }

    event.currentTarget.classList.add('clicked');

    const foodNamesToClasses = foodList => foodList.map(foodStr => `.${foodStr}`).join(', ');
    const foodNamesToIds = foodList => foodList.map(foodStr => `#${foodStr}`).join(', ');
    const notEatenFoods = foodList => lodash.difference(ALL_FOODS, foodList);

    const selectRelevantFoods = (foodList) => {
      template
        .findAll(foodNamesToIds(ALL_FOODS))
        .forEach(element => element.classList.remove('checked'));

      template
        .findAll(foodNamesToClasses(ALL_FOODS))
        .forEach(element => element.classList.remove('fadeIn'));

      template
        .findAll(foodNamesToIds(notEatenFoods(foodList)))
        .forEach(element => element.classList.add('checked'));

      template
        .findAll(foodNamesToClasses(notEatenFoods(foodList)))
        .forEach(element => element.classList.add('fadeIn'));
    };

    const dietNameToFoodTypeArray = (dietName) => {
      switch (dietName) {
        case 'Omnivore':
          return ALL_FOODS;
        case 'Vegetarian':
          return VEGETARIAN_FOODS;
        case 'Vegan':
          return VEGAN_FOODS;
        case 'Pescetarian':
          return PESCATARIAN_FOODS;
        case 'Paleo':
          return PALEO_FOODS;
        default:
          return ALL_FOODS;
      }
    };

    const dietName = event.target.closest('li').id;
    const foodTypeArray = dietNameToFoodTypeArray(dietName);

    // ////////// Experiment Pack Genration Code Start /////////////
    // const packType = {name: "paleo", number: 12};
    // const packItems = Items.find({category: "Pack"}).fetch();
    // const pack = getPack(packItems, packType);
    // const items = Items.find({category: "Meal"}).fetch();
    // const res = generateDefaultPack(pack, foodTypeArray, items, items, packItems);
    // console.log("res = %j", res);
    // ////////// Experiment Pack Genration Code End /////////////

    selectRelevantFoods(foodTypeArray);
  },

  'click .restriction'(event, template) {
    event.preventDefault();

    event.currentTarget.classList.toggle('checked');

    const itemClass = `.${event.currentTarget.id}`;
    const imgs = template.findAll(itemClass);
    for (let i = imgs.length - 1; i >= 0; i--) {
      imgs[i].classList.toggle('fadeIn');
    }

    // if restrictions match a diet != to current diet

    // change diet
  },

  'click #edit-diet-settings'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    const formdata = {};
    if (document.querySelector('input[name="diet"]:checked').value) formdata.plan = document.querySelector('input[name="diet"]:checked').value;
    const restrictions = template.findAll('.checked');
    formdata.restrictions = [];
    for (let i = restrictions.length - 1; i >= 0; i--) {
      formdata.restrictions.push(restrictions[i].id);
    }
    const user = formdata;

    Meteor.call('updateUser', Meteor.userId(), user, (error, response) => {
      if (error) {
        console.log(`${error}; error`);
      } else {
        console.log(response);
      }
    });
    sAlert.success('Settings saved!');
    Session.set('stage', 0);
    Session.set('loading', false);
  },
});
