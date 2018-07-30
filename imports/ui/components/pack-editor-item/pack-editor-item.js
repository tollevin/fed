import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';

import './pack-editor-item.html';
import '/imports/ui/components/menu-item/menu-item.less'; // TODO move this eventually

Template.Pack_Editor_Item.helpers({
  attributes: () => {
    const att = Template.currentData().attributes;
    if (!att) { return undefined; }

    const keys = Object.keys(att);
    const filtered = keys.filter(function(key) {
      return att[key];
    });
    let classes = '';
    for (let i = filtered.length - 1; i >= 0; i -= 1) {
      classes += `${filtered[i]} `;
    }
    return classes;
  },

  restrictions: () => {
    const restrictions = Template.currentData().warnings;
    if (!restrictions) { return undefined; }
    const keys = Object.keys(restrictions);
    const filtered = keys.filter(key => restrictions[key]);
    let classes = '';
    for (let i = filtered.length - 1; i >= 0; i -= 1) {
      classes += `${filtered[i]} `;
    }
    return classes;
  },

  showFullPrice: () => {
    const order = Session.get('Order');
    if (order) return order.style === 'alacarte';
    return undefined;
  },

  tally: (_id) => {
    if (!Session.get('pack')) { return undefined; }
    const packItems = Session.get('pack').sub_items.items;
    let tally = 0;

    for (let i = packItems.length - 1; i >= 0; i -= 1) {
      if (packItems[i]._id === _id) tally += 1;
    }
    return tally;
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
