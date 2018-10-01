import { Template } from 'meteor/templating';

import { remove } from '/imports/api/items/methods.js';

import './item-admin.html';

const trueValues = obj => Object.entries(obj)
  .filter(([, hasVal]) => hasVal)
  .map(([keyName]) => keyName);

Template.Item_admin.helpers({
  trueWarnings: () => {
    const warnings = Template.currentData().warnings || {};
    return trueValues(warnings);
  },

  trueAttributes: () => {
    const attributes = Template.currentData().attributes || {};
    return trueValues(attributes);
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
