import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './pack-editor-item.html';

const countInArray = function(array, what) {
  return array.filter(item => item == what).length;
};

Template.Pack_Editor_Item.helpers({
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

  tally: (_id)=> {
    if (Session.get('pack')) {
      var packItems = Session.get('pack').sub_items.items;
      var tally = 0;

      for (var i = packItems.length - 1; i >= 0; i--) {
        if (packItems[i]._id === _id) tally += 1;
      };
      return tally;
    };
  },
});

Template.Pack_Editor_Item.events({
  'click .item-details'(event) {
    event.preventDefault();

    var routeName = FlowRouter.getRouteName();
    Session.set('previousRoute', routeName);

    var newRoute = '/menu/' + Template.currentData()._id;
    FlowRouter.go(newRoute);
  },
});