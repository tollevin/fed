import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

// Template
import './pack-editor.html';

// Components
import '../components/pack-editor-item.js';

// Collections
import { Menus } from '../../api/menus/menus.js';
import { Items } from '../../api/items/items.js';

// Pack schemas
import {
  PackSchemas
} from '../../api/packs/packs.js'

// Methods
import {
  insertOrder,
  updateOrder
} from '../../api/orders/methods.js'

Template.Pack_Editor.onCreated(function packEditorOnCreated() {
  if (!Session.get('filters')) {
    var filters = {
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
    Session.set('filters', filters);
  };

  this.diet = new ReactiveVar(Session.get('filters').diet);
  this.packSize = new ReactiveVar(6);
  this.priceChange = new ReactiveVar(0);
  this.schema = new ReactiveVar({
    protein:0,
    vegetable:0,
    grain:0,
    salad:0,
    soup:0,
    total:0
  });
  this.order = new ReactiveVar(Session.get('Order'));
  var order = this.order.get();

  // If order.subscription, set diet and packSize
  // if (order && order.subscriptions.length > 0) {
  //   var packName = order.subscriptions.item_name;
  //   this.diet.set(packName.split('')[0]);
  //   this.packSize.set(packName.split('')[1].split('-')[0]);
  // };

  // If they have an order for this week (pending-sub order / created), open that pack to edit ??
  var orderId = Session.get('orderId');
  if (orderId) order = orderId;

  // If they have a pack in their order, open that pack to edit
  if (order && order.items) {
    for (var i = order.items.length - 1; i >= 0; i--) {
      if (order.items[i].category === 'Pack') { // FIX if more than meal packs / more than 1 pack?
        Session.set('pack', order.items[i]);
        this.diet.set(order.items[i].name.split(' ')[0]);
        this.packSize.set(order.items[i].sub_items.schema.total);
        order.items.splice(i, 1);
      };
    };
  };

  this.order.set(order);
  const thisWeeksStart = moment().startOf('week').toDate();

  this.autorun(() => {
    this.subscribe('Menus.active');
    this.subscribe('Items.packs');

    if (this.subscriptionsReady()) {
      var diet = this.diet.get();
      var packSize = this.packSize.get();
      var packName = diet + ' ' + packSize + '-Pack';
      var pack = Items.findOne({name: packName});
      Session.setDefault('pack', pack); 

      var menu = Menus.findOne({active: true});
      var data = {
        _id: menu._id,
        ready_by: menu.ready_by,
        delivery_windows: menu.delivery_windows
      };
      Session.setDefault('menu', data);
    };
  });
});

Template.Pack_Editor.onRendered(function packEditorOnRendered() {
});

Template.Pack_Editor.onDestroyed(function packEditorOnDestroyed() {
  Session.set('pack', null);
});

Template.Pack_Editor.helpers({
  selectedDiet: (diet)=> {
    if (diet === Template.instance().diet.get()) {
      return 'selected';
    };
  },

  selectedNumber: (packSize)=> {
    if (packSize === Template.instance().packSize.get()) {
      return 'selected';
    };
  },

  packPrice: ()=> {
    return Session.get('pack') && Session.get('pack').price_per_unit;
  },

  changePrice: ()=> {
    if (Template.instance().priceChange.get() !== 0) {
      return Template.instance().priceChange.get() > 0 ? 'plus' : 'minus';
    };
  },

  priceChange: ()=> {
    if (Template.instance().priceChange.get() !== 0) {
      return Template.instance().priceChange.get() > 0 ? Template.instance().priceChange.get().toFixed(2) : (0 - Template.instance().priceChange.get()).toFixed(2);
    };
  },

  schema: (category)=> {
    if (Session.get('pack')) {
      let subcatArray;
      category === 'Protein' ? subcatArray = ['Beef', 'Chicken', 'Fish', 'Soy'] : subcatArray = [category];

      const packItems = Session.get('pack').sub_items.items;
      var categoryInPack = 0;
      
      for (var i = packItems.length - 1; i >= 0; i--) {
        const item = Items.findOne({_id: packItems[i]._id});

        if (item && subcatArray.indexOf(item.subcategory) > -1) categoryInPack += 1;
      };

      const schema = Session.get('pack').sub_items.schema;
      return categoryInPack + ' / ' + schema[category.toLowerCase()];
    };
  },

  price: ()=> {

  },

  proteins: ()=> {
    var selector = {
      "category": "Meal",
      "subcategory": {$in: ['Beef','Chicken','Fish','Soy']},
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (var i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector["warnings." + restrictions[i]] = false;
      }
    };

    return Items.find(selector, { sort: { rank: -1 }});
  },

  vegetables: ()=> {
    var selector = {
      "category": "Meal",
      "subcategory": "Vegetable",
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (var i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector["warnings." + restrictions[i]] = false;
      }
    };

    return Items.find(selector, { sort: { rank: -1 }});
  },

  grains: ()=> {
    var selector = {
      "category": "Meal",
      "subcategory": "Grain",
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (var i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector["warnings." + restrictions[i]] = false;
      }
    };

    return Items.find(selector, { sort: { rank: -1 }});
  },

  soups: ()=> {
    var selector = {
      "category": "Meal",
      "subcategory": "Soup",
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (var i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector["warnings." + restrictions[i]] = false;
      }
    };

    return Items.find(selector, { sort: { rank: -1 }});
  },

  salads: ()=> {
    var selector = {
      "category": "Meal",
      "subcategory": "Salad",
    };
    const filtersObject = Session.get('filters').restrictions;
    const restrictions = Object.keys(filtersObject);
    for (var i = restrictions.length - 1; i >= 0; i--) {
      if (filtersObject[restrictions[i]]) {
        selector["warnings." + restrictions[i]] = false;
      }
    };

    return Items.find(selector, { sort: { rank: -1 }});
  },

  ready: ()=> {
    if (Session.get('pack')) {
      var itemTotal = Session.get('pack').sub_items.items.length;
      var schemaTotal = Session.get('pack').sub_items.schema.total;
      return itemTotal === schemaTotal && 'pack-ready';
    };
  },

  isMenu: ()=> {
    const route = FlowRouter.current().route.name;
    return route === 'Menu.show'; // FIX ?
  },

  packSpace: ()=> {
    if (Session.get('pack')) {
      var itemTotal = Session.get('pack').sub_items.items.length;
      var schemaTotal = Session.get('pack').sub_items.schema.total;
      return itemTotal + '/' + schemaTotal;
    };
  },
});

Template.Pack_Editor.events({
  'change .diet'(event, template) {
    // set diet to filters.diet
    // add basic restrictions   
    const filter = event.currentTarget.value;
    var existingFilters = Session.get('filters');
    // existingFilters.iso = '';
    existingFilters.restrictions = {
      "peanuts": false,
      "treenuts": false,
      "soy": false,
      "beef": false,
      "chicken": false,
      "fish": false,
      "shellfish": false,
      "milk": false,
      "eggs": false,
      "wheat": false,
    };

    switch (filter) {
      case "Pescetarian":
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        // existingFilters.iso.concat("':not(.beef), :not(.chicken)'");
        break;
      case "Paleo":
        existingFilters.restrictions.peanuts = true;
        existingFilters.restrictions.soy = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.wheat = true;
        // existingFilters.iso.concat("':not(.peanuts), :not(.soy), :not(.milk), :not(wheat)'");
        break;
      case "Vegetarian":
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        // existingFilters.iso.concat("':not(.beef), :not(.chicken), :not(.fish), :not(.shellfish)'");
        break;
      case "Vegan":
        existingFilters.restrictions.beef = true;
        existingFilters.restrictions.chicken = true;
        existingFilters.restrictions.fish = true;
        existingFilters.restrictions.shellfish = true;
        existingFilters.restrictions.milk = true;
        existingFilters.restrictions.eggs = true;
        // existingFilters.iso.concat("':not(.beef), :not(.chicken), :not(.fish), :not(.shellfish), :not(.milk), :not(.eggs)'");
        break;
    };

    existingFilters.diet = filter;
    Session.set('filters', existingFilters);

    Template.instance().diet.set(filter);
    var packSize = Template.instance().packSize.get();
    var packName = filter + ' ' + packSize + '-Pack';
    var pack = Items.findOne({name: packName});
    Session.set('pack', pack);
  },

  'change .packSize'(event, template) {
    const input = event.target.value;
    const name = event.target.name;
    template[name].set(input);

    var diet = Template.instance().diet.get();
    var packName = diet + ' ' + input + '-Pack';
    var pack = Items.findOne({name: packName});
    Session.set('pack', pack);
  },

  'click .accordion'(event, template) {
    event.preventDefault();

    var accordions = template.findAll('.accordion');
    var panels = template.findAll('.panel');
    var panel = event.currentTarget.nextElementSibling;

    if (panel.style.maxHeight){
      panel.style.maxHeight = null;
      event.currentTarget.classList.remove('open');
    } else {
      for (var i = panels.length - 1; i >= 0; i--) {
        panels[i].style.maxHeight = null;
        accordions[i].classList.remove('open');
      };
      event.currentTarget.classList.add('open');
      // panel.style.maxHeight = panel.scrollHeight + "px";
      panel.style.maxHeight = "375px";
    };
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
        }
      };

      var item = Items.findOne({_id: event.currentTarget.name}, options);
      (['Beef','Chicken','Fish','Soy'].indexOf(item.subcategory) > -1) ? item.subcategory = 'protein' : item.subcategory = item.subcategory.toLowerCase();
      var pack = Session.get('pack');
      var packItems = pack.sub_items.items;
      var packSchema = pack.sub_items.schema;

      // Ping here (GA)
      // Possibly Ping here if adding to an empty cart (GA)

      // If >= packSize, prompt for packUpgrade + !add-to-pack
      if (packItems.length >= pack.sub_items.schema.total) {

      } else {
        // Add to pack
        packItems.push(item);

        // Add to template schema
        var schema = Template.instance().schema.get();
        if (schema[item.subcategory]) {
          schema[item.subcategory] += 1;
        } else {
          schema[item.subcategory] = 1;
        };
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
          };

          var schemaKeys = Object.keys(schema);
          var differences = {};
          var different = false;

          for (var i = schemaKeys.length - 1; i >= 0; i--) {
            var difference = schema[schemaKeys[i]] - packSchema[schemaKeys[i]];
            differences[schemaKeys[i]] = difference;
            if (difference !== 0) different = true;
          };

          // if schema != packSchema, change pack price, add price differences to accordions
          if (different) {            
            //change pack price
            var newPrice = 0;
            for (var i = packItems.length - 1; i >= 0; i--) {
              newPrice += packItems[i].price_per_unit;
            };

            template.priceChange.set(newPrice - pack.price_per_unit);
            pack.price_per_unit = newPrice;
          };
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
                  panels[i + 1].style.maxHeight = "375px";
                  accordions[i + 1].classList.add('open');
                };
              };
            };
          };
        };
        // Update Session pack var
        pack.sub_items.items = packItems;
        Session.set('pack', pack);
      };
    } else {
      Session.set('overlay','pause');
      FlowRouter.go('join');
    }
  },

  'click .remove-from-pack'(event, template) {
    event.preventDefault();

    var pack = Session.get('pack');
    var packItems = pack.sub_items.items;

    // Ping here (GA)
    // Possibly Ping here if adding to an empty cart (GA)
    
    let item;
    var itemInPack = -1;

    for (var i = packItems.length - 1; i >= 0; i--) {
      if (packItems[i]._id === event.currentTarget.name) {
        itemInPack = i;
        item = packItems[i];
      }
    };

    if (itemInPack >= 0) {
      // Remove from template schema
      var schema = Template.instance().schema.get();
      schema[item.category] -= 1;
      schema.total -= 1;

      // Remove from Session pack items
      packItems.splice(itemInPack, 1);

      // Update Session pack var
      pack.sub_items.items = packItems;
      Session.set('pack', pack);
    };
  },

  'click .cancel'(event, template) {
    event.preventDefault();

    // If no pack
    // Set order style to alacarte
    // var order = Session.get('Order');
    // order.style = 'alacarte';
    // Session.set('Order', order);
    Session.set('pack', null);
    Session.set('overlay', false);

  },

  'click .toShop'(event, template) {
    event.preventDefault();
    Session.set('overlay', 'loading');

    var pack = Session.get('pack');
    var order = Template.instance().order.get();
    var menu = Session.get('menu');
    
    // if order._id, update instead of insert
    if (order._id) {
      // replace pack
      for (var i = order.items.length - 1; i >= 0; i--) {
        if (order.items[i]._id === pack._id) order.items[i] = pack;
      };
      // update order
      const updatedOrder = updateOrder.call(order)
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
    };

    Session.set('pack', null);
    Session.set('overlay', null);
    FlowRouter.go('/market');
  },

  'click .toCheckout'(event, template) {
    event.preventDefault();
    Session.set('overlay', 'loading');

    var pack = Session.get('pack');
    var order = Template.instance().order.get();
    var menu = Session.get('menu');
    
    // if order._id, update instead of insert
    if (order._id) {
      // replace pack
      for (var i = order.items.length - 1; i >= 0; i--) {
        if (order.items[i]._id === pack._id) order.items[i] = pack;
      };
      // update order
      const updatedOrder = updateOrder.call(order)
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
    };

    Session.set('pack', null);
    Session.set('overlay', null);
    FlowRouter.go('/checkout');
  },
});