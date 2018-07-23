import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import { Items } from '/imports/api/items/items.js';

import moment from 'moment';

import './menu-item.less';
import './menu-item.html';

const countInArray = function(array, what) {
  return array.filter(item => item == what).length;
};

Template.Menu_item.helpers({
  attributes: () => {
    const att = Template.currentData().attributes;
    if (att) {
      const keys = Object.keys(att);
      const filtered = keys.filter(function(key) {
        return att[key];
      });
      let classes = '';
      for (let i = filtered.length - 1; i >= 0; i--) {
        classes += `${filtered[i]} `;
      }
  		return classes;
    }
  },

  restrictions: () => {
    const restrictions = Template.currentData().warnings;
    if (restrictions) {
      const keys = Object.keys(restrictions);
      const filtered = keys.filter(function(key) {
        return restrictions[key];
      });
      let classes = '';
      for (let i = filtered.length - 1; i >= 0; i--) {
        classes += `${filtered[i]} `;
      }
      return classes;
    }
  },

  showFullPrice: () => {
    const order = Session.get('Order');
    return order && (order.style === 'alacarte');
  },

  toFixed: price => price.toFixed(2),

  tally: () => {
    if (Session.get('Order') && Session.get('Order').items) {
      const itemList = Session.get('Order').items;
      const itemName = Template.currentData().name;
      const packItems = [];
      const packItemNames = [];
      const cartItemNames = [];
      for (var i = itemList.length - 1; i >= 0; i--) {
        if (itemList[i].category === 'Pack') {
          for (let j = itemList[i].sub_items.items.length - 1; j >= 0; j--) {
            packItems.push(itemList[i].sub_items.items[j]);
          }
        } else {
          cartItemNames.push(itemList[i].name);
        }
      }
      for (var i = packItems.length - 1; i >= 0; i--) {
        packItemNames.push(packItems[i].name);
      }

      const countInPacks = countInArray(packItemNames, itemName);
      const countInCart = countInArray(cartItemNames, itemName);
      return countInPacks + countInCart;
    }
  },
});

Template.Menu_item.events({
  'click .item-details'(event) {
    event.preventDefault();

    const routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    const newRoute = `/menu/${Template.currentData()._id}`;
    FlowRouter.go(newRoute);
  },

  'click .add-to-cart'(event, template) {
    event.preventDefault();

    const afterWednes = moment().day() > 3;
    const sundayBeforeNoon = moment().day() === 0 && moment().hour() < 12;

    if (afterWednes || sundayBeforeNoon) {
      Session.set('customizable', false);
    } else if (Meteor.user()) {
      const options = {
        fields: {
          _id: 1,
          name: 1,
          category: 1,
          description: 1,
          price_per_unit: 1,
          photo: 1,
        },
      };

      const item = Items.findOne({ name: Template.currentData().name }, options);
  		const order = Session.get('Order');

      // Ping here (GA)
      // Possibly Ping here if adding to an empty cart (GA)


      order.items.push(item);
      Session.set('Order', order);
    } else {
      FlowRouter.go('join');
    }
  },

  'click .remove-from-cart'(event, template) {
    event.preventDefault();

    const afterWednes = moment().day() > 3;
    const sundayBeforeNoon = moment().day() === 0 && moment().hour() < 12;

    if (afterWednes || sundayBeforeNoon) {
      Session.set('customizable', false);
    } else if (Meteor.user()) {
      const options = {
        fields: {
          _id: 1,
          name: 1,
          category: 1,
        },
      };

      const item = Items.findOne({ name: Template.currentData().name }, options);
      const order = Session.get('Order');

      // Ping here (GA)
      // Possibly Ping here if adding to an empty cart (GA)
      let itemInCart;
      // let packWithItem;
      for (let i = order.items.length - 1; i >= 0; i--) {
        if (order.items[i]._id === item._id) {
          itemInCart = {
            index: i,
          };
        }
      }

      if (itemInCart) {
        order.items.splice(itemInCart.index, 1);
        Session.set('Order', order);
      }
    } else {
      FlowRouter.go('join');
    }
  },
});
