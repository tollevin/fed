import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { toggleActive, toggleInPack, remove } from '/imports/api/items/methods.js';

import './item-admin.html';

Template.Item_admin.helpers({
  trueWarnings: () => {
    const warnings = Template.currentData().warnings;
    const warningsKeys = Object.keys(warnings);
    const trueWarnings = [];

    for (let i = warningsKeys.length - 1; i >= 0; i--) {
      if (warnings[warningsKeys[i]]) trueWarnings.push(warningsKeys[i]);
    }

    return trueWarnings;
  },

  trueAttributes: () => {
    const attributes = Template.currentData().attributes;
    const attributesKeys = Object.keys(attributes);
    const trueAttributes = [];

    for (let i = attributesKeys.length - 1; i >= 0; i--) {
      if (attributes[attributesKeys[i]]) trueAttributes.push(attributesKeys[i]);
    }

    return trueAttributes;
  },
});

Template.Item_admin.events({
  'change [name="thisWeek"]'(event) {
    const checked = $(event.target).is(':checked');

    toggleActive.call({
      itemId: Template.currentData()._id,
    });
  },

  'change [name="omnivorePack"]'(event) {
    const checked = $(event.target).is(':checked');

    toggleInPack.call({
      itemId: Template.currentData()._id,
      pack: event.target.name,
    });
  },

  'change [name="vegetarianPack"]'(event) {
    const checked = $(event.target).is(':checked');

    toggleInPack.call({
      itemId: Template.currentData()._id,
      pack: event.target.name,
    });
  },

  'change [name="veganPack"]'(event) {
    const checked = $(event.target).is(':checked');

    toggleInPack.call({
      itemId: Template.currentData()._id,
      pack: event.target.name,
    });
  },

  'click #Remove'(event) {
    event.preventDefault();

    remove.call({
      _id: Template.currentData()._id,
    });
  },
});
