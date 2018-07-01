import './modals.html';

import '/imports/ui/components/filters/filters.js';
import '/imports/ui/components/cart/cart.js';
import '/imports/ui/components/pack-select/pack-select.js';

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
    const route = FlowRouter.getRouteName();
    const uncustomizable = Session.get('customizable') === false;
    return route === 'Menu.show' && uncustomizable && 'uncustomizable';
  },
});