import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Promos } from '../../api/promos/promos.js';

// import { 
// 	insertPromo,
// 	// update
// } from '../../api/promos/methods.js';

import './promos-admin.html';

// Components used inside the template
import '../components/new-promo.js';
import '../components/promo-admin.js';

Template.Promos_admin.onCreated(function promosAdminOnCreated() {
  this.autorun(() => {
    this.subscribe('all.promos', 100);
  });
});

Template.Promos_admin.helpers({
  promos: ()=> {
  	return Promos.find({}, { sort: { createdAt: -1 } });
  },
});