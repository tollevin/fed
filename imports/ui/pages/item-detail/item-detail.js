import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';

import { Items } from '/imports/api/items/items.js';

import './item-detail.less';
import './item-detail.html';

Template.Item_detail.onCreated(function menuItemOnCreated() {
  this.cartWasOpen = Session.get('cartOpen');
  Session.set('cartOpen', false);

  const id = FlowRouter.getParam('_id');

  this.autorun(() => {
    this.subscribe('singleItem', id);

    const item = Items.findOne();
    if (item) {
      // GA
      ga('ec:addProduct', {
        'id': item._id,
        'name': item.name,
        'category': item.category,
        'brand': item.producer,
      });

      ga('ec:setAction', 'detail');
      ga('send', 'event', 'UX', 'detail');
    }
  });
});

Template.Item_detail.onRendered(function menuItemOnrendered() {
});

Template.Item_detail.helpers({
  item() {
    const id = FlowRouter.getParam('_id');
    return Items.findOne({ _id: id });
  },

  contains() {
    const id = FlowRouter.getParam('_id');
    const thisItem = Items.findOne({ _id: id });
    let allergens = false;
    let allergenArray = [];
    if (thisItem) {
      const { warnings } = thisItem;
      const keys = Object.keys(warnings);
      for (let i = keys.length - 1; i >= 0; i -= 1) {
        if (warnings[keys[i]]) {
          allergens = true;
          allergenArray.push(keys[i]);
        }
      }
    }
    return allergens && allergenArray;
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
    const { dishes } = order;
    for (let i = 0; i < dishes.length; i += 1) {
      if (!dishes[i]) {
        dishes[i] = item.name;
        order.dishes = dishes;
        Session.set('order', order);
        i = 0;
        FlowRouter.go('Menu.show');
        break;
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
