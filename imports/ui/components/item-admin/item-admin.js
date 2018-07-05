import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import { Items } from '/imports/api/items/items.js';

import {
	toggleActive,
  toggleInPack,
	remove,
} from '/imports/api/items/methods.js';

import './item-admin.html';

Template.Item_admin.onCreated(function itemAdminOnCreated() {
  this.autorun(() => {
    // new SimpleSchema({
    //   item: { type: Items._helpers },
    //   // editing: { type: Boolean, optional: true },
    //   // onEditingChange: { type: Function },
    // }).validate(Template.currentData());
  });
});

Template.Item_admin.helpers({
  trueWarnings: ()=> {
    const warnings = Template.currentData().warnings;
    const warningsKeys = Object.keys(warnings);
    var trueWarnings = [];

    for (var i = warningsKeys.length - 1; i >= 0; i--) {
      if (warnings[warningsKeys[i]]) trueWarnings.push(warningsKeys[i])
    };

    return trueWarnings;
  },

  trueAttributes: ()=> {
    const attributes = Template.currentData().attributes;
    const attributesKeys = Object.keys(attributes);
    var trueAttributes = [];

    for (var i = attributesKeys.length - 1; i >= 0; i--) {
      if (attributes[attributesKeys[i]]) trueAttributes.push(attributesKeys[i])
    };

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

  'click #Remove'(event){
    event.preventDefault();

    remove.call({
      _id: Template.currentData()._id,
    });
  }
});