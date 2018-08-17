import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';

import './menu-item.less';
import './menu-item.html';

const countInArray = function (array, what) {
  return array.filter(item => item === what).length;
};

Template.Menu_item.helpers({
  attributes: () => {
    const att = Template.currentData().attributes;
    if (!att) { return undefined; }

    const keys = Object.keys(att);
    const filtered = keys.filter(key => att[key]);
    let classes = '';
    for (let i = filtered.length - 1; i >= 0; i -= 1) {
      classes += `${filtered[i]} `;
    }
    return classes;
  },

  restrictions: () => {
    const restrictions = Template.currentData().warnings;
    if (!restrictions) { return undefined; }
    const keys = Object.keys(restrictions);
    const filtered = keys.filter(function (key) {
      return restrictions[key];
    });
    let classes = '';
    for (let i = filtered.length - 1; i >= 0; i -= 1) {
      classes += `${filtered[i]} `;
    }
    return classes;
  },

  showFullPrice: () => {
    const order = Session.get('Order');
    return order && (order.style === 'alacarte');
  },

  toFixed: price => price.toFixed(2),

  tally: () => {
    if (!(Session.get('Order') && Session.get('Order').items)) { return undefined; }

    const itemList = Session.get('Order').items;
    const itemName = Template.currentData().name;
    const packItems = [];
    const packItemNames = [];
    const cartItemNames = [];
    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (itemList[i].category === 'Pack') {
        for (let j = itemList[i].sub_items.items.length - 1; j >= 0; j -= 1) {
          packItems.push(itemList[i].sub_items.items[j]);
        }
      } else {
        cartItemNames.push(itemList[i].name);
      }
    }
    for (let i = packItems.length - 1; i >= 0; i -= 1) {
      packItemNames.push(packItems[i].name);
    }

    const countInPacks = countInArray(packItemNames, itemName);
    const countInCart = countInArray(cartItemNames, itemName);
    return countInPacks + countInCart;
  },
});

Template.Menu_item.events({
  'click .item-details'(event) {
    event.preventDefault();

    // GA
    const item = Template.currentData();
    ga('ec:addProduct', {
      id: item._id,
      name: item.name,
      category: item.category,
      brand: item.producer,
    });
    ga('ec:setAction', 'click', { list: 'Menu' });
    ga('send', 'event', 'UX', 'click', 'Menu Items');

    const routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    const newRoute = `/menu/${Template.currentData()._id}`;
    FlowRouter.go(newRoute);
  },

  'click .add-to-cart'(event) {
    event.preventDefault();

    const afterWednes = moment().day() > 3;
    const sundayBeforeNoon = moment().day() === 0 && moment().hour() < 12;

    if (afterWednes || sundayBeforeNoon) {
      Session.set('customizable', false);
      return;
    }

    if (!Meteor.user()) {
      FlowRouter.go('join');
      return;
    }

    const item = Template.currentData();
    const partialItemData = {
      _id: item._id,
      name: item.name,
      category: item.category,
      description: item.description,
      price_per_unit: item.price_per_unit,
      photo: item.photo,
    };

    const order = Session.get('Order');

    // GA
    ga('ec:addProduct', {
      id: item._id,
      name: item.name,
      category: item.category,
      brand: item.producer,
      variant: item.variant,
      price: item.price_per_unit,
      quantity: 1,
    });
    ga('ec:setAction', 'add');
    ga('send', 'event', 'UX', 'click', 'add to cart');

    order.items.push(partialItemData);
    Session.set('Order', order);
  },

  'click .remove-from-cart'(event) {
    event.preventDefault();

    const afterWednes = moment().day() > 3;
    const sundayBeforeNoon = moment().day() === 0 && moment().hour() < 12;

    if (afterWednes || sundayBeforeNoon) {
      Session.set('customizable', false);
      return;
    }

    if (!Meteor.user()) {
      FlowRouter.go('join');
      return;
    }

    const item = Template.currentData();
    const order = Session.get('Order');

    // GA
    ga('ec:addProduct', {
      id: item._id,
      name: item.name,
      category: item.category,
      brand: item.producer,
      variant: item.variant,
      price: item.price_per_unit,
      quantity: 1,
    });
    ga('ec:setAction', 'remove');
    ga('send', 'event', 'UX', 'click', 'remove from cart');

    let itemInCart;
    // let packWithItem;
    for (let i = order.items.length - 1; i >= 0; i -= 1) {
      if (order.items[i]._id === item._id) {
        itemInCart = { index: i };
      }
    }

    if (itemInCart) {
      order.items.splice(itemInCart.index, 1);
      Session.set('Order', order);
    }
  },
});
