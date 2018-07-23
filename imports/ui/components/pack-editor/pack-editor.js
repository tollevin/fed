import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

// Components
import '/imports/ui/components/pack-editor-item/pack-editor-item.js';

// Collections
import { Menus } from '/imports/api/menus/menus.js';
import { Items } from '/imports/api/items/items.js';

// Methods
import { insertOrder, updatePendingSubOrder } from '/imports/api/orders/methods.js';
import { RESTRICTION_TO_ITEM_RESTRICTION } from '/imports/ui/lib/pack_picker/pack_planner.js';

// Template
import './pack-editor.less';
import './pack-editor.html';

Template.Pack_Editor.onCreated(function packEditorOnCreated() {
  // if no filters, set defaults
  if (!Session.get('filters')) {
    const user = Meteor.user();
    let diet = 'Omnivore';
    const restrictions = {
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
    };

    if (user) {
      diet = user.diet;
      const restrictionsArray = [];
      for (var i = user.restrictions.length - 1; i >= 0; i--) {
        restrictionsArray.push(RESTRICTION_TO_ITEM_RESTRICTION[user.restrictions[i]]);
      }

      for (var i = restrictionsArray.length - 1; i >= 0; i--) {
        restrictions[restrictionsArray[i]] = true;
      }
    }

    const filters = {
      diet,
      restrictions,
    };

    Session.set('filters', filters);
  }

  this.diet = new ReactiveVar(Session.get('filters').diet);
  this.packSize = new ReactiveVar(6);
  this.priceChange = new ReactiveVar(0);
  this.schema = new ReactiveVar({
    protein: 0,
    vegetable: 0,
    grain: 0,
    salad: 0,
    soup: 0,
    total: 0,
  });
  this.order = new ReactiveVar(Session.get('Order'));
  let order = this.order.get();

  // If they have an order for this week (pending-sub order / created), open that pack to edit ??
  const orderId = Session.get('orderId');
  if (!order && orderId) order = orderId;

  // If order.subscription, set diet and packSize
  if (order && order.subscriptions && order.subscriptions.length > 0) {
    let packName = order.subscriptions[0].item_name; // FIX
    if (!packName) packName = order.subscriptions.item_name;
    this.diet.set(packName.split(' ')[0]);
    this.packSize.set(parseInt(packName.split(' ')[1].split('-')[0]));
  }

  // If they have a pack in their order, open that pack to edit
  if (order && order.items && order.items.length > 0) {
    for (var i = order.items.length - 1; i >= 0; i--) {
      if (order.items[i].category === 'Pack') { // FIX if more than meal packs / more than 1 pack?
        Session.set('pack', order.items[i]);
        this.diet.set(order.items[i].name.split(' ')[0]);
        this.packSize.set(order.items[i].sub_items.schema.total);
        order.items.splice(i, 1);
      }
    }
  }

  this.order.set(order);
  const thisWeeksStart = moment().startOf('week').utc().toDate();

  this.autorun(() => {
    this.subscribe('Menus.active');
    this.subscribe('Items.packs');

    if (this.subscriptionsReady()) {
      const diet = this.diet.get();
      const packSize = this.packSize.get();
      const packName = `${diet} ${packSize}-Pack`;
      const pack = Items.findOne({ name: packName });
      Session.set('pack', pack);

      const menu = Menus.findOne({ active: true });
      const data = {
        _id: menu._id,
        ready_by: menu.ready_by,
        delivery_windows: menu.delivery_windows,
      };
      Session.setDefault('menu', data);
    }
  });
});

Template.Pack_Editor.onDestroyed(function packEditorOnDestroyed() {
  Session.set('pack', null);
});

Template.Pack_Editor.helpers({
  selectedDiet: (diet) => {
    if (diet === Template.instance().diet.get()) {
      return 'selected';
    }
  },

  selectedNumber: (packSize) => {
    if (packSize === Template.instance().packSize.get()) {
      return 'selected';
    }
  },

  packPrice: () => Session.get('pack') && Session.get('pack').price_per_unit,

  changePrice: () => {
    if (Template.instance().priceChange.get() !== 0) {
      return Template.instance().priceChange.get() > 0 ? 'plus' : 'minus';
    }
  },

  priceChange: () => {
    if (Template.instance().priceChange.get() !== 0) {
      return Template.instance().priceChange.get() > 0 ? Template.instance().priceChange.get().toFixed(2) : (0 - Template.instance().priceChange.get()).toFixed(2);
    }
  },

  schema: (category) => {
    if (Session.get('pack')) {
      let subcatArray;
      category === 'Protein' ? subcatArray = ['Beef', 'Chicken', 'Fish', 'Soy'] : subcatArray = [category];

      const packItems = Session.get('pack').sub_items.items;
      let categoryInPack = 0;

      for (let i = packItems.length - 1; i >= 0; i--) {
        const item = Items.findOne({ _id: packItems[i]._id });

        if (item && subcatArray.indexOf(item.subcategory) > -1) categoryInPack += 1;
      }

      const schema = Session.get('pack').sub_items.schema;
      return `${categoryInPack} / ${schema[category.toLowerCase()]}`;
    }
  },

  price: () => {

  },

  proteins: () => {
    const selector = {
      category: 'Meal',
      subcategory: { $in: ['Beef', 'Chicken', 'Fish', 'Soy'] },
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (let i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector[`warnings.${restrictions[i]}`] = false;
      }
    }

    return Items.find(selector, { sort: { rank: -1 } });
  },

  vegetables: () => {
    const selector = {
      category: 'Meal',
      subcategory: 'Vegetable',
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (let i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector[`warnings.${restrictions[i]}`] = false;
      }
    }

    return Items.find(selector, { sort: { rank: -1 } });
  },

  grains: () => {
    const selector = {
      category: 'Meal',
      subcategory: 'Grain',
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (let i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector[`warnings.${restrictions[i]}`] = false;
      }
    }

    return Items.find(selector, { sort: { rank: -1 } });
  },

  soups: () => {
    const selector = {
      category: 'Meal',
      subcategory: 'Soup',
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (let i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector[`warnings.${restrictions[i]}`] = false;
      }
    }

    return Items.find(selector, { sort: { rank: -1 } });
  },

  salads: () => {
    const selector = {
      category: 'Meal',
      subcategory: 'Salad',
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (let i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector[`warnings.${restrictions[i]}`] = false;
      }
    }

    return Items.find(selector, { sort: { rank: -1 } });
  },

  ready: () => {
    if (Session.get('pack')) {
      const itemTotal = Session.get('pack').sub_items.items.length;
      const schemaTotal = Session.get('pack').sub_items.schema.total;
      return itemTotal === schemaTotal && 'pack-ready';
    }
  },

  notSubscribe: () => {
    const route = FlowRouter.current().route.name;
    return route != 'Subscribe'; // FIX ?
  },

  packSpace: () => {
    if (Session.get('pack')) {
      const itemTotal = Session.get('pack').sub_items.items.length;
      const schemaTotal = Session.get('pack').sub_items.schema.total;
      return `${itemTotal}/${schemaTotal}`;
    }
  },
});

Template.Pack_Editor.events({
  'change .diet'(event, template) {
    // set diet to filters.diet
    // add basic restrictions
    const filter = event.currentTarget.value;
    const existingFilters = Session.get('filters');
    // existingFilters.iso = '';
    existingFilters.restrictions = {
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
    };

    switch (filter) {
      case 'Pescetarian':
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        // existingFilters.iso.concat("':not(.beef), :not(.chicken)'");
        break;
      case 'Paleo':
        existingFilters.restrictions.peanuts = true;
        existingFilters.restrictions.soy = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.wheat = true;
        // existingFilters.iso.concat("':not(.peanuts), :not(.soy), :not(.milk), :not(wheat)'");
        break;
      case 'Vegetarian':
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        // existingFilters.iso.concat("':not(.beef), :not(.chicken), :not(.fish), :not(.shellfish)'");
        break;
      case 'Vegan':
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.eggs = true;
        // existingFilters.iso.concat("':not(.beef), :not(.chicken), :not(.fish), :not(.shellfish), :not(.milk), :not(.eggs)'");
        break;
    }

    existingFilters.diet = filter;
    Session.set('filters', existingFilters);

    Template.instance().diet.set(filter);
    const packSize = Template.instance().packSize.get();
    const packName = `${filter} ${packSize}-Pack`;
    const pack = Items.findOne({ name: packName });
    Session.set('pack', pack);
  },

  'change .packSize'(event, template) {
    const input = event.target.value;
    const name = event.target.name;
    template[name].set(input);

    const diet = Template.instance().diet.get();
    const packName = `${diet} ${input}-Pack`;
    const pack = Items.findOne({ name: packName });
    Session.set('pack', pack);
  },

  'click .accordion'(event, template) {
    event.preventDefault();

    const accordions = template.findAll('.accordion');
    const panels = template.findAll('.panel');
    const panel = event.currentTarget.nextElementSibling;

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
      event.currentTarget.classList.remove('open');
    } else {
      for (let i = panels.length - 1; i >= 0; i--) {
        panels[i].style.maxHeight = null;
        accordions[i].classList.remove('open');
      }
      event.currentTarget.classList.add('open');
      // panel.style.maxHeight = panel.scrollHeight + "px";
      panel.style.maxHeight = '375px';
    }
  },

  'click .add-to-pack'(event, template) {
    event.preventDefault();

    if (Meteor.user()) {
      const options = {
        fields: {
          _id: 1,
          name: 1,
          category: 1,
          subcategory: 1,
          description: 1,
          price_per_unit: 1,
          photo: 1,
        },
      };

      const item = Items.findOne({ _id: event.currentTarget.name }, options);
      (['Beef', 'Chicken', 'Fish', 'Soy'].indexOf(item.subcategory) > -1) ? item.subcategory = 'protein' : item.subcategory = item.subcategory.toLowerCase();
      const pack = Session.get('pack');
      const packItems = pack.sub_items.items;
      const packSchema = pack.sub_items.schema;

      // Ping here (GA)
      // Possibly Ping here if adding to an empty cart (GA)

      // If >= packSize, prompt for packUpgrade + !add-to-pack
      if (packItems.length >= pack.sub_items.schema.total) {

      } else {
        // Add to pack
        packItems.push(item);

        // Add to template schema
        const schema = Template.instance().schema.get();
        if (schema[item.subcategory]) {
          schema[item.subcategory] += 1;
        } else {
          schema[item.subcategory] = 1;
        }
        schema.total += 1;

        Template.instance().schema.set(schema);

        // if pack is full,
        if (schema.total === packSchema.total) {
          var accordions = template.findAll('.accordion');
          var panels = template.findAll('.panel');

          // close all accordion tabs
          for (var i = panels.length - 1; i >= 0; i--) {
            // close current panel, restyle
            panels[i].style.maxHeight = null;
            accordions[i].classList.remove('open');
          }

          const schemaKeys = Object.keys(schema);
          const differences = {};
          let different = false;

          for (var i = schemaKeys.length - 1; i >= 0; i--) {
            const difference = schema[schemaKeys[i]] - packSchema[schemaKeys[i]];
            differences[schemaKeys[i]] = difference;
            if (difference !== 0) different = true;
          }

          // if schema != packSchema, change pack price, add price differences to accordions
          if (different) {
            // change pack price
            let newPrice = 0;
            for (var i = packItems.length - 1; i >= 0; i--) {
              newPrice += packItems[i].price_per_unit;
            }

            template.priceChange.set(newPrice - pack.price_per_unit);
            pack.price_per_unit = newPrice;
          }
        } else {
          template.priceChange.set(0);
          // if schema[subcategory] === numInPack, close panel and open next
          if (schema[item.subcategory] === packSchema[item.subcategory]) {
            var accordions = template.findAll('.accordion');
            var panels = template.findAll('.panel');

            for (var i = panels.length - 1; i >= 0; i--) {
              if (panels[i].style.maxHeight) {
                // close current panel, restyle
                // panels[i].style.maxHeight = null;
                // accordions[i].classList.remove('open');
                accordions[i].classList.add('filled');

                // open next panel
                if (i + 1 < panels.length) {
                  panels[i + 1].style.maxHeight = '375px';
                  accordions[i + 1].classList.add('open');
                }
              }
            }
          }
        }
        // Update Session pack var
        pack.sub_items.items = packItems;
        Session.set('pack', pack);
      }
    } else {
      Session.set('overlay', 'pause');
      FlowRouter.go('join');
    }
  },

  'click .remove-from-pack'(event, template) {
    event.preventDefault();

    const pack = Session.get('pack');
    const packItems = pack.sub_items.items;

    // Ping here (GA)
    // Possibly Ping here if adding to an empty cart (GA)

    let item;
    let itemInPack = -1;

    for (let i = packItems.length - 1; i >= 0; i--) {
      if (packItems[i]._id === event.currentTarget.name) {
        itemInPack = i;
        item = packItems[i];
      }
    }

    if (itemInPack >= 0) {
      // Remove from template schema
      const schema = Template.instance().schema.get();
      schema[item.category] -= 1;
      schema.total -= 1;

      // Remove from Session pack items
      packItems.splice(itemInPack, 1);

      // Update Session pack var
      pack.sub_items.items = packItems;
      Session.set('pack', pack);
    }
  },

  'click .cancel'(event, template) {
    event.preventDefault();

    Session.set('pack', null);
    Session.set('overlay', false);
  },

  'click .toMarket'(event, template) {
    event.preventDefault();
    Session.set('overlay', 'loading');

    const pack = Session.get('pack');
    const order = Template.instance().order.get();
    const menu = Session.get('menu');

    // if order._id, update instead of insert
    if (order._id) {
      // replace pack
      for (let i = order.items.length - 1; i >= 0; i--) {
        if (order.items[i]._id === pack._id) order.items[i] = pack;
      }
      // update order
      const updatedOrder = updateOrder.call(order);
      Session.set('Order', updatedOrder);
    } else {
      order.items.push(pack);

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

    Session.set('pack', null);
    Session.set('overlay', null);
    FlowRouter.go('/market');
  },

  'click .toCheckout'(event, template) {
    event.preventDefault();
    Session.set('overlay', 'loading');

    const pack = Session.get('pack');
    const order = Template.instance().order.get();
    const menu = Session.get('menu');

    // if order._id, update instead of insert
    if (order._id && order.status === ('pending-sub' || 'skipped')) {
      // replace pack
      order.items.push(pack);
      // update order
      const updatedOrder = updatePendingSubOrder.call(order);
      Session.set('Order', updatedOrder);
    } else {
      order.items.push(pack);

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

    Session.set('pack', null);
    Session.set('overlay', null);
    FlowRouter.go('/checkout');
  },
});
