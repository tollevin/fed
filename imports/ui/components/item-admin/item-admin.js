import { Template } from 'meteor/templating';

import { remove } from '/imports/api/items/methods.js';

import './item-admin.html';

Template.Item_admin.helpers({
  trueWarnings: () => {
    const { warnings } = Template.currentData();
    const warningsKeys = Object.keys(warnings);
    const trueWarnings = [];

    for (let i = warningsKeys.length - 1; i >= 0; i -= 1) {
      if (warnings[warningsKeys[i]]) trueWarnings.push(warningsKeys[i]);
    }

    return trueWarnings;
  },

  trueAttributes: () => {
    const { attributes } = Template.currentData();
    const attributesKeys = Object.keys(attributes);
    const trueAttributes = [];

    for (let i = attributesKeys.length - 1; i >= 0; i -= 1) {
      if (attributes[attributesKeys[i]]) trueAttributes.push(attributesKeys[i]);
    }

    return trueAttributes;
  },
});

Template.Item_admin.events({
  'click #Remove'(event) {
    event.preventDefault();

    remove.call({
      _id: Template.currentData()._id,
    });
  },
});
