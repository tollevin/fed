import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
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
    if (id) {
      const customer = Meteor.users.findOne({_id: id});
      return customer;
    };
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

  'click #CrEdit' (event, template) {
    event.preventDefault();
    const newCredit = template.find('[name="currentCredit"]').value;
    if (newCredit) {
      const user = FlowRouter.getParam('_id');
      var newCreditToFloat = parseFloat(newCredit);
      const data = {
        credit: newCreditToFloat,
      };

      Meteor.call( 'updateUser', user, data, ( error, response ) => {
        if ( error ) {
          console.log(error + ": error");
        } else {
          console.log(response);
        };
      });
    } else {
      const errorElement = template.find('[name="currentCredit"]');
      errorElement.classList.add('StripeElement--invalid');;
    }
  },
});