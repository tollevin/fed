import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './pack-settings.less';
import './pack-settings.html';

Template.Pack_settings.onCreated(function packSettingsOnCreated() {
  this.diet = new ReactiveVar(Meteor.user().diet);
  this.restrictions = new ReactiveVar(Meteor.user().restrictions);
  this.deliveryDay = new ReactiveVar(Meteor.user().preferredDelivDay);
});

Template.Pack_settings.helpers({
  restrictions() {
    const allRestrictions = ['beef', 'chicken', 'fish', 'shellfish', 'eggs', 'dairy', 'nuts', 'peanuts', 'soy', 'gluten'];
    return allRestrictions;
  },
});
