import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import './item-detail.html';
import { Items } from '../../api/items/items.js';

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
		return Items.findOne({_id: id});
	},

  contains() {
    const id = FlowRouter.getParam('_id');
    const thisItem = Items.findOne({_id: id});
    const warnings = thisItem.warnings;
    var allergens = false;
    for (var i = Object.keys(warnings).length - 1; i >= 0; i--) {
      if (warnings[i]) {
        allergens = true;
      };
    };
    console.log(allergens);
    return allergens;
    // if (thisItem && thisItem.warnings[0]) {
    //   var warnings = "";

    //   for (var i = 0; i < thisItem.warnings.length; i++) {
    //     warnings.concat(thisItem.warnings[i] + ", ")
    //   };

    //   warnings.slice(0, (warnings.length - 1));
    //   return warnings;
    // } else {
    //   const context = Template.currentData();
    //   console.log(context);
    //   return false;
    // };
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
    const item = Items.findOne({_id: id});

		var order = Session.get('order');
		var dishes = order.dishes;
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
    		if (i === dishes.length - 1){
      		sAlert.error('Your pack is full!');
    		};
    	};
		};
	},

  // const context = Template.currentData();

  //     order = Session.get('order');
  //     dishes = order.dishes;
  //     for (i = 0; i < dishes.length; i++) { 
  //       if (!dishes[i]) {
  //         dishes[i] = context.name;
  //         order.dishes = dishes;
  //         Session.set('order', order);
  //         i = 0;
  //         break;
  //       } else {
  //         continue;
  //         if (i === dishes.length - 1){
  //         alert('Your pack is full!');
  //         };
  //       };
  //     };

  'click #Back' (event) {
    event.preventDefault();

    if (!Session.get('previousRoute')) {
      Session.set('previousRoute','Menu.show')
    }
    FlowRouter.go(Session.get('previousRoute'));
  },
});