import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import './menu-snack.html';
import { Items } from '../../api/items/items.js';

Template.Menu_snack.onCreated(function menuItemOnCreated() {
  // this.autorun(() => {
  //   this.subscribe('singleItem');
  // });
});

Template.Menu_snack.helpers({
 //  soldOut: ()=> {
 //    return item.soldOut;
	// },
});

Template.Menu_snack.events({
	'click .add-to-cart'(event) {
		event.preventDefault();
		const context = Template.currentData();

		order = Session.get('order');
		snacks = order.snacks;
		for (i = 0; i < snacks.length; i++) { 
    	if (!snacks[i]) {
    		snacks[i] = context.name;
    		order.snacks = snacks;
    		Session.set('order', order);
    		i = 0;
    		break;
    	} else {
    		continue;
    		if (i === snacks.length - 1){
    		alert('Your pack is full!');
    		};
    	};
		};
	},
});