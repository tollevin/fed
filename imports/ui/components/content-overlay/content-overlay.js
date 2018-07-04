import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '/imports/ui/components/pack-editor/pack-editor.js';

import './content-overlay.less';
import './content-overlay.html';

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

  packEditorOpen: ()=> {
    return Session.equals('overlay', 'packEditor') && 'packEditor';
  },

  closed() {
    const route = FlowRouter.getRouteName();
    const uncustomizable = Session.get('customizable') === false;
    return (route === 'Menu.show' || 'Market') && uncustomizable && 'uncustomizable';
    // return false;
    // return route === 'Menu.show' && 'uncustomizable';
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

    // const route = FlowRouter.getRouteName();
  },

  'click .x'(event) {
    Session.set('customizable', true);
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