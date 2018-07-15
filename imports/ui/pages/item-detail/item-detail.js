import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';

import { Items } from '/imports/api/items/items.js';

import './item-detail.less';
import './item-detail.html';

Template.Item_detail.onCreated(function menuItemOnCreated() {
  const id = FlowRouter.getParam('_id');

  this.autorun(() => {
    this.subscribe('singleItem', id);
  });

  this.cartWasOpen = Session.get('cartOpen');

  Session.set('cartOpen', false);
});

Template.Item_detail.helpers({
  item() {
    const id = FlowRouter.getParam('_id');
    return Items.findOne({ _id: id });
  },

  contains() {
    const id = FlowRouter.getParam('_id');
    const thisItem = Items.findOne({ _id: id });
    const warnings = thisItem.warnings;
    let allergens = false;
    for (let i = Object.keys(warnings).length - 1; i >= 0; i--) {
      if (warnings[i]) {
        allergens = true;
      }
    }
    return allergens;
  },

  fromMenu() {
    return Template.instance().cartWasOpen;
  },

  Back() {
    return Session.get('previousRoute');
  },
});

Template.Item_detail.events({
  'click .add-to-cart'(event) {
    event.preventDefault();

    const id = FlowRouter.getParam('_id');
    const item = Items.findOne({ _id: id });

    const order = Session.get('order');
    const dishes = order.dishes;
    for (i = 0; i < dishes.length; i++) {
    	if (!dishes[i]) {
    		dishes[i] = item.name;
    		order.dishes = dishes;
    		Session.set('order', order);
        i = 0;
        FlowRouter.go('Menu.show');
        break;
    	} else {
        continue;
    		if (i === dishes.length - 1) {
      		sAlert.error('Your pack is full!');
    		}
    	}
    }
  },

  'click #Back' (event) {
    event.preventDefault();

    if (!Session.get('previousRoute')) {
      Session.set('previousRoute', 'Menu.show');
    }
    FlowRouter.go(Session.get('previousRoute'));
  },
});
