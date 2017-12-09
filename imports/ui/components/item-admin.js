import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import './item-admin.html';
import { Items } from '../../api/items/items.js';

import {
	toggleActive,
  toggleInPack,
	// update,
	remove,
} from '../../api/items/methods.js';

Template.Item_admin.onCreated(function itemAdminOnCreated() {
  this.autorun(() => {
    new SimpleSchema({
      item: { type: Items._helpers },
      // editing: { type: Boolean, optional: true },
      // onEditingChange: { type: Function },
    }).validate(Template.currentData());
  });
});

Template.Item_admin.helpers({
  thisWeek() {
    return Template.currentData().active && 'checked';
  },

  omni() {
    return Template.currentData().packs.omnivorePack && 'checked';
  },

  veggie() {
    return Template.currentData().packs.vegetarianPack && 'checked';
  },

  vegan() {
    return Template.currentData().packs.veganPack && 'checked';
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