import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import { Items } from '/imports/api/items/items.js';

import './menu-item.less';
import './menu-item.html';

const countInArray = function(array, what) {
  return array.filter(item => item == what).length;
};

Template.Menu_item.onCreated(function menuItemOnCreated() {
  // this.veganized = new ReactiveVar(false);
});

Template.Menu_item.helpers({
	attributes: ()=> {
    var att = Template.currentData().attributes;
    if (att) {
      var keys = Object.keys(att);
      var filtered = keys.filter(function(key) {
          return att[key];
      });
      var classes = '';
      for (var i = filtered.length - 1; i >= 0; i--) {
        classes+= filtered[i] + ' ';
      }
  		return classes;
    }
	},

  restrictions: ()=> {
    var restrictions = Template.currentData().warnings;
    if (restrictions) {
      var keys = Object.keys(restrictions);
      var filtered = keys.filter(function(key) {
          return restrictions[key];
      });
      var classes = '';
      for (var i = filtered.length - 1; i >= 0; i--) {
        classes+= filtered[i] + ' ';
      }
      return classes;
    }
  },

  showFullPrice: ()=> {
    const order = Session.get('Order');
    if (order) return order.style === 'alacarte';
  },

  toFixed: (price)=> {
    return price.toFixed(2);
  },

  showAddOnPrice: ()=> {
    const order = Session.get('Order');
    if (order && order.style === 'pack') {
      const subcategory = Template.currentData().subcategory;
      // ...
    }
  },

  addOnPrice: ()=> {

  },

  tally: ()=> {
    if (Session.get('Order') && Session.get('Order').items) {
      var itemList = Session.get('Order').items;
      var itemName = Template.currentData().name;
      var packItems = [];
      var packItemNames = [];
      var cartItemNames = [];
      for (var i = itemList.length - 1; i >= 0; i--) {
        if (itemList[i].category === 'Pack') {
          for (var j = itemList[i].sub_items.items.length - 1; j >= 0; j--) {
            packItems.push(itemList[i].sub_items.items[j]);
          };
        } else {
          cartItemNames.push(itemList[i].name)
        };
      };
      for (var i = packItems.length - 1; i >= 0; i--) {
        packItemNames.push(packItems[i].name)
      };

      const countInPacks = countInArray(packItemNames, itemName);
      const countInCart = countInArray(cartItemNames, itemName);
      return countInPacks + countInCart;
    };
  },
});

Template.Menu_item.events({
  'click .item-details'(event) {
    event.preventDefault();

    var routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    var newRoute = '/menu/' + Template.currentData()._id;
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
        }
      };

      const item = Items.findOne({name: Template.currentData().name}, options);
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
        }
      };

      const item = Items.findOne({name: Template.currentData().name}, options);
      const order = Session.get('Order');

      // Ping here (GA)
      // Possibly Ping here if adding to an empty cart (GA)
      let itemInCart;
      // let packWithItem;
      for (var i = order.items.length - 1; i >= 0; i--) {
        if (order.items[i]._id === item._id) {
          itemInCart = {
            index: i,
          };
        };
      };

      if (itemInCart) {
        order.items.splice(itemInCart.index, 1);
        Session.set('Order', order);
      };
    } else {
      FlowRouter.go('join');
    }
  },
});