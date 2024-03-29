import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './menu-toolbar.less';
import './menu-toolbar.html';

Template.Menu_toolbar.onCreated(function menuToolbarOnCreated() {
  Session.setDefault('packEditorOpen', false);
  Session.setDefault('cartOpen', false);
});

Template.Menu_toolbar.helpers({
  dietFilter: () => Session.get('filters').diet,

  userHasRestrictions: () => Session.get('filters').restrictions.length,

  filterMenuOpen: () => Session.get('filterMenuOpen') && 'filterMenuOpen',

  cartOpen: () => Session.get('cartOpen'),

  packEditorOpen: () => Session.get('packEditorOpen') && 'packEditorOpen',

  hasPack: () => {
    const order = Session.get('Order');
    return order && order.style === 'pack';
  },

  dishesInPack: () => {
    const order = Session.get('Order');
    if (!(order && order.style === 'pack')) { return undefined; }

    const { items } = order;
    if (!items) { return undefined; }

    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (items[i].category.toLowerCase() === 'pack') {
        if (items[i].sub_items.schema.total >= items[i].sub_items.items.length) {
          return items[i].sub_items.items.length;
        }
      }
    }
    return undefined;
  },

  packSize: () => {
    const order = Session.get('Order');
    if (!(order && order.style === 'pack')) { return undefined; }

    const { items } = order;
    if (!items) { return undefined; }

    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (items[i].category.toLowerCase() === 'pack') {
        if (items[i].sub_items.schema.total >= items[i].sub_items.items.length) {
          return items[i].sub_items.schema.total;
        }
      }
    }
    return undefined;
  },
});

Template.Menu_toolbar.events({
  'click #Filter-menu-toggle'(event) {
    event.preventDefault();

    Session.set('filterMenuOpen', !Session.get('filterMenuOpen'));
    Session.set('cartOpen', false);
  },

  'click #Cart-toggle'(event) {
    event.preventDefault();

    Session.set('cartOpen', !Session.get('cartOpen'));
    Session.set('filterMenuOpen', false);
  },
});
