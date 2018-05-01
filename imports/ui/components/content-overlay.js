import { ReactiveVar } from 'meteor/reactive-var';

import './content-overlay.html';

import './style-select.js';
import './pack-select.js';
import './pack-editor.js';


Template.Content_Overlay.onCreated(function menuItemOnCreated() {

});

Template.Content_Overlay.helpers({
  active: ()=> { // for all uses
    return Session.get('overlay') && 'active';
  },

	loading: ()=> {
    return Session.get('loading') && 'loading';
  },

  filterMenuOpen: ()=> {
    return Session.get('filterMenuOpen') && 'filterMenuOpen';
  },

  cartOpen() {
    return Session.get('cartOpen') && 'cartOpen';
  },

  selectStyle: ()=> {
    const route = FlowRouter.getRouteName();
    const order = Session.get('Order');
    return route === 'Menu.show' && !order && 'selectStyle';
  },

  // selectPack: ()=> {
  //   const route = FlowRouter.getRouteName();
  //   const order = Session.get('Order');
  //   const packOrder = order && order.style === 'pack';
  //   return route === 'Menu.show' && packOrder && !order.items && 'selectPack';
  // },

  packEditorOpen: ()=> {
    return Session.equals('overlay', 'packEditor') && 'packEditor';
  },

  closed() {
    const route = FlowRouter.getRouteName();
    const uncustomizable = Session.get('customizable') === false;
    return route === 'Menu.show' && uncustomizable && 'uncustomizable';
  },

  capped() {
    const route = FlowRouter.getRouteName();
    return route === 'Menu.show' && Session.get('capped') && !Session.get('subscribed') && 'capped';
  },
});

Template.Content_Overlay.events({
  'click .content-overlay'(event) {
    Session.set('filterMenuOpen', false);
    Session.set('cartOpen', false);

    const route = FlowRouter.getRouteName();
  },

  // 'click #Filters-panel'(event) {
  //   event.stopImmediatePropagation();
  // },

  // 'click #cart'(event) {
  //   event.stopImmediatePropagation();
  // },

  // 'click .js-logout'(event) {
  //   // event.preventDefault();
  //   // event.stopImmediatePropagation();
  //   Meteor.logout();
  // },
});