import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';

import './customer-detail.less';
import './customer-detail.html';

Template.Customer_detail.onCreated(function customerDetailOnCreated() {
  const id = FlowRouter.getParam('_id');

  this.subscribe('thisUserData', id);
});

Template.Customer_detail.helpers({
  customer() {
    const id = FlowRouter.getParam('_id');
    if (!id) { return undefined; }
    return Meteor.users.findOne({ _id: id });
  },

  Back() {
    return Session.get('previousRoute');
  },
});

Template.Customer_detail.events({
  'click #Back' (event) {
    event.preventDefault();

    FlowRouter.go('Customers.admin');
  },

  'click #CrEdit' (event, templateInstance) {
    event.preventDefault();
    const newCredit = templateInstance.find('[name="currentCredit"]').value;
    if (newCredit) {
      const user = FlowRouter.getParam('_id');
      const newCreditToFloat = parseFloat(newCredit);
      const data = {
        credit: newCreditToFloat,
      };

      Meteor.call('updateUser', user, data, () => {});
    } else {
      const errorElement = templateInstance.find('[name="currentCredit"]');
      errorElement.classList.add('StripeElement--invalid');
    }
  },
});
