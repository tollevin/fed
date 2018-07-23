import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './pack-item.html';

Template.Pack_item.events({
  'click a' (event) {
    event.preventDefault();

    const routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    const newRoute = `/menu/${Template.currentData()._id}`;
    FlowRouter.go(newRoute);
  },
});
