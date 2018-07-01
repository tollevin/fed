import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Items } from '/imports/api/items/items.js';

// Components used inside the template
import '/imports/ui/components/new-item/new-item.js';
import '/imports/ui/components/item-admin/item-admin.js';

import './menu-admin.less';
import './menu-admin.html';

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