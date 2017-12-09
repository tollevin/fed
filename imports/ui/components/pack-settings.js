import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
// import { FlowRouter } from 'meteor/kadira:flow-router';
// import { Session } from 'meteor/session';
// import { Tracker } from 'meteor/tracker';

import './pack-settings.html';

Template.Pack_settings.onCreated(function packSettingsOnCreated() {
	// const user = Meteor.user();
	this.plan = new ReactiveVar(Meteor.user().subscriptions.plan.id);
	this.diet = new ReactiveVar(Meteor.user().diet);
	this.restrictions = new ReactiveVar(Meteor.user().restrictions);
	this.deliveryDay = new ReactiveVar(Meteor.user().preferredDelivDay);
});

Template.Pack_settings.onRendered(function packSettingsOnRendered() {
  // var restrictions = template.findAll('.checked');
  // formdata.restrictions = [];
  // for (var i = restrictions.length - 1; i >= 0; i--) {
  //   formdata.restrictions.push(restrictions[i].id);
  // };
  // const user = formdata;
});

Template.Pack_settings.helpers({
	restrictions() {
    const allRestrictions = ['beef','chicken','fish','shellfish','eggs','dairy','nuts','peanuts','soy','gluten'];
    return allRestrictions;
  },
});