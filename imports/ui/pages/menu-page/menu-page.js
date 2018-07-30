import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';

// Collections
import { Items } from '/imports/api/items/items.js';
import { Menus } from '/imports/api/menus/menus.js';

// Components
import '/imports/ui/components/filters/filters.js';
import '/imports/ui/components/cart/cart.js';
import '/imports/ui/components/menu-item/menu-item.js';
import '/imports/ui/components/menu-toolbar/menu-toolbar.js';

// Methods
import { insertOrder, updatePendingSubOrder } from '/imports/api/orders/methods.js';

import './menu-page.less';
import './menu-page.html';

const createSelector = (type) => {
  const filtersObject = Session.get('filters').restrictions;

  return Object
    .entries(filtersObject)
    .reduce(
      (memo, [restriction, restrictionSelected]) =>
        restrictionSelected
        ? ({...memo, [`warnings.${restriction}`]: false})
        : memo,
    { category: type });
};

const some = (array, mapFn) => array.map(mapFn || ((a) => a)).length > 0;

Template.Menu_page.onCreated(function menuPageOnCreated() {
  const afterWednes = moment().day() > 3;
  const sundayBeforeNoon = moment().day() === 0 && moment().hour() < 12;
  if (afterWednes || sundayBeforeNoon) Session.set('customizable', false);

  Session.set('processing', false);
  const filters = {
    diet: 'Omnivore',
    restrictions: {
      peanuts: false,
      treenuts: false,
      soy: false,
      beef: false,
      chicken: false,
      fish: false,
      shellfish: false,
      milk: false,
      eggs: false,
      wheat: false,
    },
  };

  Session.setDefault('filters', filters);
  Session.setDefault('selector', {});

  const orderId = Session.get('orderId');

  if (orderId) {
    // if hasItem and isPack
    if (orderId.status === 'pending-sub') {
      for (let i = orderId.items.length - 1; i >= 0; i -= 1) {
        if (orderId.items[i].category === 'Pack') {
          if (orderId.items[i].sub_items.items.length === 0) {
            orderId.items.splice(i, 1);
          }
        }
      }
    }
    orderId.style = 'alacarte';
    Session.set('Order', orderId);
  }

  if (!Session.get('Order')) {
    const order = {
      user_id: Meteor.userId(),
      style: 'alacarte',
      items: [],
      week_of: moment().startOf('week').toDate(),
      created_at: moment().toDate(),
    };

    Session.set('Order', order);
  }

  this.autorun(() => {
    const handle = this.subscribe('Menus.active');

    if (!handle.ready()) { return; }
    // Set Session menu data if none
    const menu = Menus.findOne({ active: true });
    const data = {
      _id: menu._id,
      ready_by: menu.ready_by,
      delivery_windows: menu.delivery_windows,
    };

    Session.setDefault('menu', data);

    const pack = Session.get('pack');

    // If unfull pack, pull up pack editor
    if (pack && pack.sub_items.items.length < pack.sub_items.schema.total) {
      Session.set('overlay', 'packEditor');
    }
  });
});

Template.Menu_page.onDestroyed(function menuPageOnDestroyed() {
  // Session.set('Back', Session.get('overlay'))
  Session.set('overlay', false);
});

Template.Menu_page.helpers({
  filterMenuOpen: () => Session.get('filterMenuOpen'),
  packEditorOpen: () => Session.get('packEditorOpen'),
  cartOpen: () => Session.get('cartOpen'),
  notSubscribed: () =>!(Session.get('subscribed')),
  pack: () =>
    some(
      Session.get('Order').items,
      (item) => (item.name.split('-')[1] === 'Pack')),
});

Template.Menu_page.events({
  'click .getPack, click .edit-pack-cta'(event) {
    event.preventDefault();

    if (!Meteor.user()) {
      FlowRouter.go('join');
      return;
    }
    Session.set('overlay', 'packEditor');
  },

  'click .toSubscribe'(event) {
    event.preventDefault();

    FlowRouter.go('/subscribe');
  },

  'click .toCheckout' () {
    if (!Meteor.user()) {
      FlowRouter.go('join');
      return;
    }

    Session.set('processing', true);

    const order = Session.get('Order');
    const menu = Session.get('menu');

    if (order._id && order.status === ('pending-sub' || 'skipped')) { // FIX Add custom sub
      // update order
      const updatedOrder = updatePendingSubOrder.call(order);
      Session.set('Order', updatedOrder);
    } else {
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
    }

    Session.set('cartOpen', false);
    FlowRouter.go('/checkout');
  },
});

Template.Menu_meals.helpers({
  has: () => some(Items.find(createSelector('Meal'), { sort: { rank: -1 } })),
  meals: () => Items.find(createSelector('Meal'), { sort: { rank: -1 } }),
});

Template.Menu_snacks.helpers({
  has: () => some(Items.find(createSelector('Snack'), { sort: { rank: -1 } })),
  snacks: () => Items.find(createSelector('Snack'), { sort: { rank: -1 } }),
});

Template.Menu_drinks.helpers({
  has: () => some(Items.find(createSelector('Drink'), { sort: { rank: -1 } })),
  drinks: () => Items.find(createSelector('Drink'), { sort: { rank: -1 } }),
});

Template.Menu_packs.helpers({
  has: () => some(Items.find(createSelector('Pack'), { sort: { rank: -1 } })),
  packs: () => Items.find(createSelector('Pack'), { sort: { rank: -1 } }),
});
