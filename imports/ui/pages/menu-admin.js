import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Items } from '../../api/items/items.js';

import './menu-admin.html';

// Components used inside the template
import '../components/new-item.js';
import '../components/item-admin.js';

Template.Menu_admin.onCreated(function menuAdminOnCreated() {
  this.autorun(() => {
    this.subscribe('items.all');
  });
});

Template.Menu_admin.helpers({
  items: ()=> {
  	return Items.find({});
  },
});