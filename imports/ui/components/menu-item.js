import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import './menu-item.html';
import { Items } from '../../api/items/items.js';

Template.Menu_item.onCreated(function menuItemOnCreated() {
  // this.autorun(() => {
  //   this.subscribe('singleItem');
  // });
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
});

Template.Menu_item.events({
  'click .item-details'(event) {
    event.preventDefault();

    var routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    var newRoute = '/menu/' + Template.currentData()._id;
    FlowRouter.go(newRoute);
  },

	'click .add-to-cart'(event) {
		event.preventDefault();

    if (Meteor.user()) {
  		const context = Template.currentData();

  		order = Session.get('order');
  		dishes = order.dishes;
  		for (i = 0; i < dishes.length; i++) { 
      	if (!dishes[i]) {
      		dishes[i] = context.name;
      		order.dishes = dishes;
      		Session.set('order', order);
      		i = 0;
      		break;
      	} else {
      		continue;
      		if (i === dishes.length - 1){
      		alert('Your pack is full!');
      		};
      	};
  		};
    } else {
      FlowRouter.go('join');
    }
	},
});