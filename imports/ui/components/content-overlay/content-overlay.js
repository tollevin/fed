import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';

import '/imports/ui/components/pack-editor/pack-editor.js';

import './content-overlay.less';
import './content-overlay.html';

Template.Content_Overlay.helpers({
  active: () => Session.get('overlay') && 'active',

  loading: () => Session.get('loading') && 'loading',

  filterMenuOpen: () => Session.get('filterMenuOpen') && 'filterMenuOpen',

  cartOpen() {
    return Session.get('cartOpen') && 'cartOpen';
  },
  packEditorOpen: () => Session.equals('overlay', 'packEditor') && 'packEditor',

  closed() {
    const route = FlowRouter.getRouteName();
    const uncustomizable = Session.get('customizable') === false;
    return (route === 'Menu.show' || 'Market') && uncustomizable && 'uncustomizable';
  },

  capped() {
    const route = FlowRouter.getRouteName();
    return route === 'Menu.show' && Session.get('capped') && !Session.get('subscribed') && 'capped';
  },
});

Template.Content_Overlay.events({
  'click .content-overlay'() {
    Session.set('filterMenuOpen', false);
    Session.set('cartOpen', false);
  },

  'click .x'() {
    Session.set('customizable', true);
  },
});
