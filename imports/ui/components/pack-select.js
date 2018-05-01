import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import './pack-select.html';

import { Items } from '../../api/items/items.js';

import {
  PackSchemas
} from '../../api/packs/packs.js'

Template.Pack_select.onCreated(function packSelectOnCreated() {
  this.diet = new ReactiveVar('omnivore');
  this.number = new ReactiveVar('6');

  var subs = this.subscribe('Items.packs');

});

Template.Pack_select.onRendered(function packSelectOnRendered() {
});

Template.Pack_select.helpers({
	packSchema: ()=> {
    const diet = Template.instance().diet.get();
    const number = Template.instance().number.get();
    const pack = PackSchemas[diet][number];
    return pack.schema;
  },

  packOriginalPrice: ()=> {
    const diet = Template.instance().diet.get();
    const number = Template.instance().number.get();
    const pack = PackSchemas[diet][number];
    return pack.price;
  },

  packPrice: ()=> {
    const price = Template.currentData().price * 95 / 100;
    return price.toFixed(2);
  },

  greaterThanZero: (plate)=> {
    return (plate > 0);
  },

  greaterThanOne: (plate)=> {
    return (plate > 1) && 's';
  },
});

Template.Pack_select.events({
  'change select'(event, template) {
    const input = event.target.value;
    const name = event.target.name;
    template[name].set(input);
  },

  'click button'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    const diet = template.diet.get();
    const dietCapitalized = diet[0].toUpperCase() + diet.substr(1);
    const number = template.number.get();
    const packName = dietCapitalized + ' ' + number + '-Pack';
    const pack = Items.findOne({name: packName});

    var order = Session.get('Order');
    if (order.items) {
      // Check to see if pack subscription exists, 'Add another?/Edit' prompt
      order.items.push(pack);
    } else {
      order.items = [ pack ];
    };

    var existingFilters = Session.get('filters');
    existingFilters.restrictions = {
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

    switch (diet.toLowerCase()) {
      case "pescetarian":
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        break;
      case "paleo":
        existingFilters.restrictions.peanuts = true;
        existingFilters.restrictions.soy = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.wheat = true;
        break;
      case "vegetarian":
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        break;
      case "vegan":
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.eggs = true;
        break;
    };

    existingFilters.diet = dietCapitalized;
    Session.set('filters', existingFilters);
    Session.set('Order', order);
    Session.set('loading', false);
  },
});