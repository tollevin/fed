import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment';

import './style-select.html';

Template.Style_select.onCreated(function styleSelectOnCreated() {
});

Template.Style_select.helpers({
	
});

Template.Style_select.events({
  'click .pack'(event, template) {
  	event.preventDefault();

  	const order = {
  		user_id: Meteor.userId(),
  		style: 'pack',
      items: [],
      week_of: moment().startOf('week').toDate(),
      created_at: moment().toDate(),
  	};

  	Session.set('Order', order);
    Session.set('overlay','packEditor');
  },

  'click .alacarte'(event, template) {
  	event.preventDefault();

  	const order = {
  		user_id: Meteor.userId(),
  		style: 'alacarte',
      items: [],
      week_of: moment().startOf('week').toDate(),
      created_at: moment().toDate(),
  	};

  	Session.set('Order', order);
  },
});