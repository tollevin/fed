import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './pack-editor-item.html';

const countInArray = function(array, what) {
  return array.filter(item => item == what).length;
};

Template.Pack_Editor_Item.helpers({
  attributes: () => {
    const att = Template.currentData().attributes;
    if (att) {
      const keys = Object.keys(att);
      const filtered = keys.filter(function(key) {
        return att[key];
      });
      let classes = '';
      for (let i = filtered.length - 1; i >= 0; i--) {
        classes += `${filtered[i]} `;
      }
  		return classes;
    }
  },

  restrictions: () => {
    const restrictions = Template.currentData().warnings;
    if (restrictions) {
      const keys = Object.keys(restrictions);
      const filtered = keys.filter(function(key) {
        return restrictions[key];
      });
      let classes = '';
      for (let i = filtered.length - 1; i >= 0; i--) {
        classes += `${filtered[i]} `;
      }
      return classes;
    }
  },

  showFullPrice: () => {
    const order = Session.get('Order');
    if (order) return order.style === 'alacarte';
  },

  tally: (_id) => {
    if (Session.get('pack')) {
      const packItems = Session.get('pack').sub_items.items;
      let tally = 0;

      for (let i = packItems.length - 1; i >= 0; i--) {
        if (packItems[i]._id === _id) tally += 1;
      }
      return tally;
    }
  },
});

Template.Pack_Editor_Item.events({
  'click .item-details'(event) {
    event.preventDefault();

    const routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    const newRoute = `/menu/${Template.currentData()._id}`;
    FlowRouter.go(newRoute);
  },
});
