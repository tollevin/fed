import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './pack-item.html';
import { Items } from '/imports/api/items/items.js';

Template.Pack_item.onCreated(function packItemOnCreated() {
  // this.autorun(() => {
  //   this.subscribe('singleItem');
  // });
});

Template.Pack_item.helpers({
	// item: ()=> {
	// 	var id = FlowRouter.getParam('id');
	// 	return Items.findOne({_id: id});
	// },

	// pathForItem: function() {
 //    var item = this;
 //    var params = {
 //      _id: item._id,
 //    };

 //    var queryParams = {previous: FlowRouter.current().route};
 //    var routeName = "/menu/:_id";
 //    var path = FlowRouter.path(routeName, params, queryParams);

 //    return path;
 //  },
});

Template.Pack_item.events({
	'click a' (event) {
		event.preventDefault();

		var routeName = FlowRouter.getRouteName();
		Session.set('previousRoute', routeName);

		var newRoute = '/menu/' + Template.currentData()._id;
		FlowRouter.go(newRoute);
	}
});