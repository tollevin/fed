import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './modals.html';

import '/imports/ui/components/filters/filters.js';
import '/imports/ui/components/cart/cart.js';

Template.Modals.onCreated(function menuItemOnCreated() {
});

Template.Modals.helpers({
  loading: () => Session.get('loading') && 'loading',

  filterMenuOpen: () => Session.get('filterMenuOpen') && 'filterMenuOpen',

  packEditorOpen() {
    return Session.get('packEditorOpen');
  },

  cartOpen() {
    return Session.get('cartOpen') && 'cartOpen';
  },

  selectPack: () => !Session.get('Order'),

  closed() {
    const route = FlowRouter.getRouteName();
    const uncustomizable = Session.get('customizable') === false;
    return route === 'Menu.show' && uncustomizable && 'uncustomizable';
  },
});
