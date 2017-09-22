import './order-preview.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Orders } from '../../api/orders/orders.js';

Template.Order_preview.onCreated(function orderPreviewOnCreated() {
  this.autorun(() => {
    this.subscribe('single.order', this._id);
    this.subscribe('thisUserData', this.userId);
  });
});

Template.Order_preview.helpers({
  customer() {
  	return Meteor.users.findOne({_id: this.userId});
  },
});