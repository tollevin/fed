import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { ReactiveVar } from 'meteor/reactive-var';
import { lodash } from 'meteor/erasaur:meteor-lodash';

import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';
import { Items } from '/imports/api/items/items.js';

import {
  ALL_FOODS, VEGETARIAN_FOODS, VEGAN_FOODS, PESCATARIAN_FOODS, PALEO_FOODS,
}
  from '/imports/ui/lib/pack_picker/diet_food_restrictions.js';
import { RESTRICTION_TO_ITEM_RESTRICTION, generateDefaultPack, getPack } from '/imports/ui/lib/pack_picker/pack_planner.js';

// Methods
import { insertPlan } from '/imports/api/plans/methods.js';

// Components
import '/imports/ui/components/pack-schemas/pack-schemas.js';
import '/imports/ui/components/stripe-card-element/stripe-card-element.js';
import '/imports/ui/components/delivery-day-toggle/delivery-day-toggle.js';
import '/imports/ui/components/pack-editor/pack-editor.js';
import '/imports/ui/components/sign-up-modal/sign-up-modal.js';

// Template
import './subscribe.less';
import './subscribe.html';

Template.Subscribe.onCreated(function subscribeOnCreated() {
  // Set vars
  this.userHasPromo = new ReactiveVar(false);
  Session.set('cartOpen', false);
  Session.setDefault('stage', 0);
  this.diet = new ReactiveVar('Omnivore');
  this.restrictions = new ReactiveVar([]);
  this.preferredDelivDay = new ReactiveVar('sunday');
  this.skip_first_delivery = new ReactiveVar(false);
  this.menu_id = new ReactiveVar(false);
  Session.setDefault('signIn', false);

  const now = moment().toDate();

  this.autorun(() => {
    this.subscribe('thisUserData');
    this.subscribe('DeliveryWindows.nextTwoWeeks', now);
    this.subscribe('Items.packs');
  });
});

Template.Subscribe.onRendered(function freeTrialOnRendered() {
  Session.set('loading', false);
});

Template.Subscribe.helpers({
  signIn() {
    return Session.get('signIn');
  },

  currentForm(thisForm) {
    var cf;
    switch (Session.get('stage')) {
      case undefined:
        var cf = 'diet';
        break;
      case 0:
        var cf = 'diet';
        break;
      case 1:
        var cf = 'plan';
        break;
      case 2:
        var cf = 'meals';
        break;
      case 3:
        var cf = 'delivery';
        break;
    }

    if (cf === thisForm) {
      return 'currentForm';
    }
  },

  diet() {
    return !Session.get('stage');
  },

  restrictions() {
    return ALL_FOODS;
  },

  plan() {
    return (Session.get('stage') === 1);
  },

  meals() {
    return (Session.get('stage') === 2);
  },

  delivery() {
    return (Session.get('stage') === 3);
  },

  userDiet() {
    return Template.instance().diet.get();
  },

  thisWeek: () => {
    const skipping = Template.instance().skip_first_delivery.get();
    if (!skipping) {
      const preferredDelivDay = Template.instance().preferredDelivDay.get();
      const deliveries = DeliveryWindows.find({ delivery_day: preferredDelivDay }).fetch();
      const delivery = deliveries[0];
      const date = moment(delivery.delivery_start_time);
      const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
      const dateToString = `${date.format('dddd, MMMM Do, h')}-${endDate.format('ha')}`;
      return dateToString;
    }
  },

  nextWeek: () => {
    const preferredDelivDay = Template.instance().preferredDelivDay.get();
    const deliveries = DeliveryWindows.find({ delivery_day: preferredDelivDay }).fetch();
    const delivery = deliveries[1];
    const date = moment(delivery.delivery_start_time);
    const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
    const dateToString = `${date.format('dddd, MMMM Do, h')}-${endDate.format('ha')}`;
    return dateToString;
  },
});

Template.Subscribe.events({

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

  'click #next0'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    const diet = template.find('.clicked');

    if (!diet) {
      sAlert.error('Please choose a diet.');
      Session.set('loading', false);
    } else {
      const restrictions = template.findAll('.checked');
      const restrictionsArray = [];
      for (var i = restrictions.length - 1; i >= 0; i--) {
        restrictionsArray.push(RESTRICTION_TO_ITEM_RESTRICTION[restrictions[i].id]);
      }

      const dietToUpperCase = diet.innerText[0].toUpperCase() + diet.innerText.slice(1);
      const restrictionsObject = {
        peanuts: false,
        treenuts: false,
        soy: false,
        beef: false,
        chicken: false,
        fish: false,
        shellfish: false,
        milk: false,
        eggs: false,
        wheat: false,
      };

      for (var i = restrictionsArray.length - 1; i >= 0; i--) {
        restrictionsObject[restrictionsArray[i]] = true;
      }

      const filters = {
        diet: dietToUpperCase,
        restrictions: restrictionsObject,
      };

      Session.set('filters', filters);
      template.diet.set(dietToUpperCase);

      Session.set('loading', false);
      if (!Meteor.userId()) {
        Session.set('signIn', true);
      } else {
        Session.set('stage', 1);
        $('.content-scrollable').scrollTop(0, 2000);
      }
    }
  },

  'click #Plan li label'(event, template) {
    const plans = template.findAll('#Plan li label');
    for (let i = plans.length - 1; i >= 0; i--) {
      plans[i].classList.remove('chosen');
    }
    event.currentTarget.classList.add('chosen');
    const checked = event.currentTarget.firstElementChild.checked;
    event.currentTarget.firstElementChild.checked = true;
  },

  'change #delivery-day-checkbox'(event, template) {
    if (document.getElementById('delivery-day-checkbox').checked) {
      template.preferredDelivDay.set('monday');
    } else {
      template.preferredDelivDay.set('sunday');
    }
  },

  'click #skip-first-delivery'(event, template) {
    event.preventDefault();

    template.skip_first_delivery.set(true);
  },

  'click #unskip-first-delivery'(event, template) {
    event.preventDefault();

    template.skip_first_delivery.set(false);
  },

  'click #next1'(event, template) {
    event.preventDefault();

    const packSelected = document.querySelector('input[name="plan"]:checked');

    if (packSelected) {
      Session.set('loading', true);

      const packName = document.querySelector('input[name="plan"]:checked').value;
      const deliveryDay = template.preferredDelivDay.get();
      const skipping = template.skip_first_delivery.get();
      const week_of = skipping ? moment().add(1, 'week').startOf('week').toDate() : moment().startOf('week').toDate();
      const pack = Items.findOne({ name: packName });

      // check if plan exists FIX
      const data = {
        item_id: pack._id,
        price: pack.price_per_unit,
        quantity: 1,
        frequency: 7,
      };

      let planExists = pack.plans(data); // FIX!!
      console.log(planExists);

      // if !plan, insert plan
      if (!planExists) {
        planExists = insertPlan.call(data);
      }

      planExists.item_name = packName;

      let order;
      if (Session.get('Order')) {
        order = Session.get('Order');
        order.style = 'pack';

        // Check to see if pack subscription exists, 'Add another?/Edit' prompt
        order.items ? order.items.push(pack) : order.items = [pack];

        if (order.subscriptions) {
          order.subscriptions.push(planExists);
        } else {
          order.subscriptions = [planExists];
        }
      } else {
        order = {
          user_id: Meteor.userId(),
          week_of,
          items: [
            pack,
          ],
          created_at: moment().toDate(),
          style: 'pack',
          subscriptions: [planExists],
        };
      }

      Session.set('Order', order);
      Session.set('loading', false);
      Session.set('stage', 2);

      const filters = Session.get('filters');
      const restrictions = filters.restrictions;
      const restrictionsArray = [];
      const restrictionsKeys = Object.keys(restrictions);

      for (let i = restrictionsKeys.length - 1; i >= 0; i--) {
        if (restrictions[restrictionsKeys[i]]) restrictionsArray.push(restrictionsKeys[i]);
      }

      const userData = {
        restrictions: restrictionsArray,
        diet: filters.diet,
        preferredDelivDay: deliveryDay,
      };

      Meteor.call('updateUser', Meteor.userId(), userData);
    } else {
      sAlert.error('Please choose a plan');
    }
  },
});
