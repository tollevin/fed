import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from '/imports/ui/routes.js'
import { $ } from 'meteor/jquery';

import { Items } from '/imports/api/items/items.js';

import './item-detail.less';
import './item-detail.html';

Template.Item_detail.onCreated(function menuItemOnCreated() {
  const id = Router.getParam('_id');

  this.autorun(() => {
    this.subscribe('singleItem', id);
  });

  this.cartWasOpen = Session.get('cartOpen');

  Session.set('cartOpen', false);
});

Template.Item_detail.helpers({
	item() {
    const id = Router.getParam('_id');
		return Items.findOne({_id: id});
	},

  contains() {
    const id = Router.getParam('_id');
    const thisItem = Items.findOne({_id: id});
    const warnings = thisItem.warnings;
    var allergens = false;
    for (var i = Object.keys(warnings).length - 1; i >= 0; i--) {
      if (warnings[i]) {
        allergens = true;
      };
    };
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

    const id = Router.getParam('_id');
    const item = Items.findOne({_id: id});

		var order = Session.get('order');
		var dishes = order.dishes;
		for (i = 0; i < dishes.length; i++) { 
    	if (!dishes[i]) {
    		dishes[i] = item.name;
    		order.dishes = dishes;
    		Session.set('order', order);
        i = 0;
        Router.go('/menu');
        break;
    	} else {
        continue;
    		if (i === dishes.length - 1){
      		sAlert.error('Your pack is full!');
    		};
    	};
		};
	},

  'click #Back' (event) {
    event.preventDefault();

    if (!Session.get('previousRoute')) {
      Session.set('previousRoute','Menu.show')
    }
    Router.go(Session.get('previousRoute'));
  },
});