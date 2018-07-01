import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Promos } from '/imports/api/promos/promos.js';

import './promo-admin.html';

Template.Promo_admin.onCreated(function promoAdminOnCreated() {
  this.autorun(() => {
    this.subscribe('single.promo', this._id);
  });
});

Template.Promo_admin.helpers({
  value() {
  	const promo = Promos.findOne({_id: Template.currentData()._id});
  	if (promo.credit) {
  		return ("Credit for $" + promo.credit );
  	} else {
  		return (promo.percentage + "% off");
  	};
  },
});