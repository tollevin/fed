import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { sAlert } from 'meteor/juliancwirko:s-alert';

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

Template.Pack_settings.events({
  'click #DeliveryDay li label'(event, templateInstance) {
    const delivery = templateInstance.findAll('#DeliveryDay li');
    delivery[0].style.borderColor = '#034b2c';
    delivery[1].style.borderColor = '#034b2c';
    delivery[0].style.backgroundColor = 'transparent';
    delivery[1].style.backgroundColor = 'transparent';
    event.target.closest('li').style.borderColor = '#fff';
    event.target.closest('li').style.backgroundColor = '#fff';
  },
  'click .sbmtPack'(event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    const formdata = {};
    if (document.querySelector('input[name="plan"]:checked').value) formdata.plan = document.querySelector('input[name="plan"]:checked').value;
    if (document.querySelector('input[name="diet"]:checked').value) formdata.plan = document.querySelector('input[name="diet"]:checked').value;
    if (document.querySelector('input[name="delivery"]:checked').value) formdata.preferredDelivDay = document.querySelector('input[name="delivery"]:checked').value;

    formdata.restrictions = templateInstance.findAll('.checked').map(restriction => restriction.id);

    Meteor.call('updateUser', Meteor.userId(), formdata, () => {});
    sAlert.success('Settings saved!');
    Session.set('stage', 0);
    Session.set('loading', false);
  },
});
