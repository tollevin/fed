import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './filters.less';
import './filters.html';

Template.Filters.helpers({
  filterMenuOpen: () => Session.get('filterMenuOpen') && 'filterMenuOpen',

  diets: () => {
    const diets = ['Omnivore', 'Vegetarian', 'Vegan', 'Pescetarian', 'Paleo'];
    return diets;
  },

  restrictions: () => {
    const restrictions = ['Peanuts', 'Shellfish', 'Milk', 'Eggs', 'Beef', 'Chicken', 'Fish', 'Soy', 'Wheat'];
    return restrictions;
  },

  isActiveDiet: (diet) => {
    const filters = Session.get('filters');
    return filters.diet.toLowerCase() === diet.toLowerCase() && 'active';
  },

  isActiveRestriction: (restriction) => {
    const { restrictions } = Session.get('filters');
    return restrictions[restriction.toLowerCase()] === true && 'active';
  },
});

Template.Filters.events({
  'click .diet-filter-button'(event) {
    event.preventDefault();

    // set diet to filters.diet
    // add basic restrictions
    const filter = event.target.name;
    const existingFilters = Session.get('filters');
    // existingFilters.iso = '';
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

    switch (filter) {
      case 'Pescetarian':
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        break;
      case 'Paleo':
        existingFilters.restrictions.peanuts = true;
        existingFilters.restrictions.soy = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.wheat = true;
        break;
      case 'Vegetarian':
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        break;
      case 'Vegan':
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.eggs = true;
        break;
      default:
        break;
    }

    existingFilters.diet = filter;
    Session.set('filters', existingFilters);
  },

  'click .restrictions-filter-button'(event) {
    event.preventDefault();

    const filter = event.target.name.toLowerCase();
    const existingFilters = Session.get('filters');
    const diet = existingFilters.diet.toLowerCase();
    const filterBool = existingFilters.restrictions[filter];

    existingFilters.restrictions[filter] = !filterBool;

    const pescetarian = existingFilters.restrictions.beef
      && existingFilters.restrictions.chicken;
    const paleo = existingFilters.restrictions.peanuts
      && existingFilters.restrictions.soy
      && existingFilters.restrictions.milk
      && existingFilters.restrictions.wheat;
    const vegetarian = existingFilters.restrictions.beef
      && existingFilters.restrictions.chicken
      && existingFilters.restrictions.fish
      && existingFilters.restrictions.shellfish;
    const vegan = existingFilters.restrictions.beef
      && existingFilters.restrictions.chicken
      && existingFilters.restrictions.fish
      && existingFilters.restrictions.shellfish
      && existingFilters.restrictions.milk
      && existingFilters.restrictions.eggs;

    if (vegan) {
      if (diet !== 'vegan') {
        existingFilters.diet = 'Vegan';
      }
    } else if (vegetarian) {
      if (diet !== 'vegetarian') {
        existingFilters.diet = 'Vegetarian';
      }
    } else if (paleo) {
      if (diet !== 'paleo') {
        existingFilters.diet = 'Paleo';
      }
    } else if (pescetarian) {
      if (diet !== 'pescetarian') {
        existingFilters.diet = 'Pescetarian';
      }
    } else {
      existingFilters.diet = 'Omnivore';
    }

    Session.set('filters', existingFilters);
  },
});
