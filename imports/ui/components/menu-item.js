import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import './menu-item.html';
import { Items } from '../../api/items/items.js';

const countInArray = function(array, what) {
  return array.filter(item => item == what).length;
};

Template.Menu_item.onCreated(function menuItemOnCreated() {
  this.veganized = new ReactiveVar(false);
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

  veganizable() {
    return Template.currentData().veganizable;
  },

  tally: ()=> {
    if (Session.get('pack')) {
      var pack = Session.get('pack').dishes;
      var itemName = Template.currentData().name;
      var veganItemName = Template.currentData().name + " (V)";
      return countInArray(pack, itemName) + countInArray(pack, veganItemName);
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

	'click .add-to-pack'(event, template) {
		event.preventDefault();

    const context = Template.currentData();

    if (Meteor.user()) {
  		const pack = Session.get('pack');
  		const dishes = pack.dishes;
  		for (i = 0; i < dishes.length; i++) { 
      	if (!dishes[i]) {
          if (template.veganized.get()) {
        		dishes[i] = context.name + " (V)";
          } else {
            dishes[i] = context.name;
          };
      		pack.dishes = dishes;
      		Session.set('pack', pack);
      		i = 0;
      		break;
      	} else {
      		continue;
      		if (i === dishes.length - 1){
      		sAlert.error('Your pack is full!');
      		};
      	};
  		};
    } else {
      FlowRouter.go('join');
    }
	},

  'click .remove-from-pack'(event, template) {
    event.preventDefault();

    const pack = Session.get('pack');
    const dishes = pack.dishes;
    let itemName;
    if (template.veganized.get()) {
      itemName = Template.currentData().name + " (V)";
    } else {
      itemName = Template.currentData().name;
    };
    if (dishes.indexOf(itemName) > -1) {
      dishes[dishes.indexOf(itemName)] = '';
      pack.dishes = dishes;
      Session.set('pack', pack);
    };
  },

  'click .veganize'(event, template) {
    template.veganized.set(!template.veganized.get());
  },
});