import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';

import './menu-snack.html';
import { Items } from '../../api/items/items.js';

const countInArray = function(array, what) {
  return array.filter(item => item == what).length;
};

Template.Menu_snack.onCreated(function menuItemOnCreated() {
  // this.autorun(() => {
  //   this.subscribe('singleItem');
  // });
});

Template.Menu_snack.helpers({
 //  soldOut: ()=> {
 //    return item.soldOut;
	// },

  tally: ()=> {
    var snacks = Session.get('pack').snacks;
    var itemName = Template.currentData().name;
    return countInArray(snacks, itemName);
  }
});

Template.Menu_snack.events({
  'click .add-to-pack'(event) {
    event.preventDefault();

    const context = Template.currentData();

    if (Meteor.user()) {
      const pack = Session.get('pack');
      const snacks = pack.snacks;
      for (i = 0; i < snacks.length; i++) { 
        if (!snacks[i]) {
          snacks[i] = context.name;
          pack.snacks = snacks;
          Session.set('pack', pack);
          i = 0;
          break;
        } else {
          continue;
          if (i === snacks.length - 1){
            sAlert.error("You've reached your snack limit!");
          };
        };
      };
    } else {
      FlowRouter.go('join');
    }
  },

  'click .remove-from-pack'(event) {
    event.preventDefault();

    const pack = Session.get('pack');
    const snacks = pack.snacks;
    if (snacks.indexOf(Template.currentData().name) > -1) {
      snacks[snacks.indexOf(Template.currentData().name)] = '';
      pack.snacks = snacks;
      Session.set('pack', pack);
    };
  },
});