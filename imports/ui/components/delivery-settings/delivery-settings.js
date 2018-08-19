import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import { SETTING_SESSION, MAIN } from '/imports/ui/lib/constants/settings';

import '/imports/ui/components/delivery-day-toggle/delivery-day-toggle.js';

import './delivery-settings.less';
import './delivery-settings.html';

Template.Delivery_settings.helpers({
  first_name: () => Meteor.user().first_name,
  last_name: () => Meteor.user().last_name,
  phone: () => Meteor.user().phone,
  email: () => Meteor.user().emails[0].address,
  address1: () => Meteor.user().address_line_1,
  address2: () => Meteor.user().address_line_2,
  city: () => Meteor.user().address_city,
  zip: () => Meteor.user().address_zipcode,
  comments: () => Meteor.user().deliv_comments,
});

Template.Delivery_settings.events({
  'submit #DeliveryForm'(event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    const formdata = {};
    if (templateInstance.find('[name="customer.firstName"]').value) formdata.first_name = templateInstance.find('[name="customer.firstName"]').value;
    if (templateInstance.find('[name="customer.lastName"]').value) formdata.last_name = templateInstance.find('[name="customer.lastName"]').value;
    if (templateInstance.find('[name="customer.phone"]').value) formdata.phone = templateInstance.find('[name="customer.phone"]').value;
    if (templateInstance.find('[name="customer.email"]').value) formdata.email = templateInstance.find('[name="customer.email"]').value;
    if (templateInstance.find('[name="customer.address.line1"]').value) formdata.address_line_1 = templateInstance.find('[name="customer.address.line1"]').value;
    if (templateInstance.find('[name="customer.address.line2"]').value) formdata.address_line_2 = templateInstance.find('[name="customer.address.line2"]').value;
    if (templateInstance.find('[name="customer.address.city"]').value) formdata.address_city = templateInstance.find('[name="customer.address.city"]').value;
    if (templateInstance.find('[name="customer.address.state"]').value) formdata.address_state = templateInstance.find('[name="customer.address.state"]').value;
    if (templateInstance.find('[name="customer.address.zipCode"]').value) formdata.address_zipcode = templateInstance.find('[name="customer.address.zipCode"]').value;
    if (templateInstance.find('[name="destinationComments"]').value) formdata.deliv_comments = templateInstance.find('[name="destinationComments"]').value;

    Meteor.call('updateUser', Meteor.userId(), formdata, (error) => {
      if (error) { return; }
      sAlert.success('Delivery settings updated!');
      Session.set(SETTING_SESSION, MAIN);
    });
    Session.set('loading', false);
  },
});
