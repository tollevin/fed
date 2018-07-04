import { Router } from '/imports/ui/routes.js'
import './modals.html';

import '/imports/ui/components/filters/filters.js';
import '/imports/ui/components/cart/cart.js';

Template.Modals.onCreated(function menuItemOnCreated() {
});

Template.Modals.helpers({
  loading: ()=> {
    return Session.get('loading') && 'loading';
  },

  filterMenuOpen: ()=> {
    return Session.get('filterMenuOpen') && 'filterMenuOpen';
  },

  packEditorOpen() {
    return Session.get('packEditorOpen');
  },

  cartOpen() {
    return Session.get('cartOpen') && 'cartOpen';
  },

  selectPack: ()=> {
    return !Session.get('Order');
  },

  closed() {
    const route = Router.getRouteName();
    const uncustomizable = Session.get('customizable') === false;
    return route === 'Menu.show' && uncustomizable && 'uncustomizable';
  },
});