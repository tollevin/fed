import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';

import { insertOrder } from '/imports/api/orders/methods.js';
import '/imports/ui/components/cart-item/cart-item.js';

import './cart.less';
import './cart.html';

Template.Cart.helpers({
  cartItems: () => {
    const order = Session.get('Order');
    const itemsObj = {};

    for (let i = order.items.length - 1; i >= 0; i -= 1) {
      if (itemsObj[order.items[i]._id]) {
        itemsObj[order.items[i]._id].tally += 1;
      } else {
        const itemToAdd = {
          tally: 1,
          item: order.items[i],
        };

        itemsObj[order.items[i]._id] = itemToAdd;
      }
    }

    return Object.values(itemsObj);
  },
  subtotal: () => {
    let subtotal = 0;
    const order = Session.get('Order');

    for (let i = order.items.length - 1; i >= 0; i -= 1) {
      subtotal += order.items[i].price_per_unit;
    }

    return subtotal.toFixed(2);
  },
});

Template.Cart.events({
  'click .remove-dish'(event) {
    const pack = Session.get('pack');
    const { dishes } = pack;
    const itemName = event.target.parentElement.closest('.dish-name').text;
    dishes[dishes.indexOf(itemName)] = '';
    pack.dishes = dishes;
    Session.set('pack', pack);
  },

  'click .remove-snack'(event) {
    const oldPack = Session.get('pack');
    const sncks = oldPack.snacks;
    sncks[event.target.name] = '';
    oldPack.snacks = sncks;
    Session.set('pack', oldPack);
  },

  'click .ready'() {
    Session.set('processing', true);

    const order = Session.get('Order');
    const menu = Session.get('menu');

    const orderToCreate = {
      user_id: Meteor.userId(),
      menu_id: menu._id,
      style: order.style,
      week_of: order.week_of,
      items: order.items,
      subscriptions: order.subscriptions,
    };

    const orderId = insertOrder.call(orderToCreate);
    Session.set('Order', orderId);
    Session.set('cartOpen', false);

    // GA
    const itemList = order.items;
    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (itemList[i].category === 'Pack') {
        ga('ec:addProduct', {
          id: itemList[i]._id,
          name: itemList[i].name,
          category: itemList[i].category,
          brand: itemList[i].producer,
          variant: itemList[i].variant,
          price: itemList[i].price_per_unit,
          quantity: 1,
        });

        for (let j = itemList[i].sub_items.items.length - 1; j >= 0; j -= 1) {
          const thisItem = itemList[i].sub_items.items[j];
          ga('ec:addProduct', {
            id: thisItem._id,
            name: thisItem.name,
            category: thisItem.category,
            brand: thisItem.producer,
            variant: thisItem.variant,
            price: thisItem.price_per_unit,
            quantity: 1,
          });
        }
      } else {
        const thisItem = itemList[i];
        ga('ec:addProduct', {
          id: thisItem._id,
          name: thisItem.name,
          category: thisItem.category,
          brand: thisItem.producer,
          variant: thisItem.variant,
          price: thisItem.price_per_unit,
          quantity: 1,
        });
      }
    }

    const currentRoute = FlowRouter.getRouteName();
    ga('ec:setAction', 'checkout', {
      step: 3,
      option: currentRoute,
    });

    ga('send', 'event', 'UX', 'checkout');


    FlowRouter.go('/checkout');
  },
});
