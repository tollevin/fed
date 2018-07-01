import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Autoform } from 'meteor/aldeed:autoform';

import { Promos } from '/imports/api/promos/promos.js';

import { insertPromo } from '/imports/api/promos/methods.js';

import './new-promo.html';

Template.NewPromo.onCreated(function newPromoOnCreated() {
  // let template = this
  // this.subscribe('items');
});

Template.NewPromo.helpers({
	promos: ()=> {
		return Promos;
	},

	insertPromo: ()=> {
		return insertPromo;
	},
});

Template.NewPromo.events({
	'click .sbmtPromo'(event, template) {
	  event.preventDefault();

	  const codes = template.find('[name="code"]').value.split('","');
  	const desc = template.find('[name="desc"]').value;
  	const credit = template.find('[name="credit"]').value;
  	const percentage = template.find('[name="percentage"]').value;
  	const expires = template.find('[name="expires"]').value;
  	const useLimitPerCustomer = template.find('[name="useLimitPerCustomer"]').value;
  	const useLimitTotal = template.find('[name="useLimitTotal"]').value;
  	const timesUsed = 0;
  	var users = {};
  	const active = template.find('[name="active"]').checked;

  	const promo = {
  		codes: codes,
  		desc: desc,
  		credit: credit,
  		percentage: percentage,
  		expires: expires,
  		useLimitPerCustomer: useLimitPerCustomer,
  		useLimitTotal: useLimitTotal,
  		timesUsed: timesUsed,
  		users: users,
  		active: active,
  	};

		insertPromo.call(promo, (err) => {
	    if (err) {
	      alert(err); // eslint-disable-line no-alert
	    }
	  });
	},
});