import { Router } from '/imports/ui/routes.js'
import { Orders } from '/imports/api/orders/orders.js';
import { Menus } from '/imports/api/menus/menus.js';

import { autoinsertSubscriberOrder } from '/imports/api/orders/methods.js';

import './customers-toolbar.html';

Template.Customers_toolbar.onCreated(function customersToolbarOnCreated() {
	const timestamp = moment().toDate();

  this.subscribe('userSearchData');
  this.subscribe('Future.orders', timestamp);
  this.subscribe('Menus.toCome');
  this.subscribe('subscriberData');
});

Template.Customers_toolbar.helpers({
	settings: ()=> {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          token: '@',
          collection: Meteor.users,
          field: "emails.address",
          matchAll: true,
          template: Template.userPill,
        },
        {
        	token: ':',
          collection: Meteor.users,
          field: "first_name",
          matchAll: true,
          template: Template.userPill,
          noMatchTemplate: Template.serverNoMatch,
        }
      ]
    };
  },
 });

Template.Customers_toolbar.events({
	'autocompleteselect input'(event, template, doc) {
    Router.go(`/customers/${doc._id}`);
  },

  'click #generateOrders'(event, template) {
    event.preventDefault();
    
    var week_of = moment().startOf('week').toDate();
    var week_two = moment().add(1,'week').startOf('week').toDate();
    var week_three = moment().add(2,'week').startOf('week').toDate();
    // console.log(week_of, week_two);
    var weeks = [week_of, week_two, week_three];

    var activeSubscribers = Meteor.users.find({'subscriptions.status': 'active'}).fetch();
    // console.log(activeSubscribers.length);

    for (var i = activeSubscribers.length - 1; i >= 0; i--) {
      // find future orders
      var futureOrders = Orders.find({ user_id: activeSubscribers[i]._id }, {sort: {ready_by: 1}}).fetch();

      // if future orders are less than 3, populate pending-sub orders (DELETE AFTER CRON!)
      if (futureOrders && futureOrders.length < 3) {
        console.log(futureOrders.length + " orders");
        let subItems;
        Meteor.call('getUserSubscriptionItems', activeSubscribers[i]._id, ( error, response ) => {
          if ( error ) {
            console.log(error + "; error");
          } else {
            console.log(2);
            subItems = response;
            var menus = Menus.find({}).fetch();
            console.log(menus.length + " menus");
            console.log(futureOrders.length + " menus");

            for (var j = futureOrders.length; j < 3; j++) {
              console.log(3);
              var menu = menus[j];

              var data = {
                user_id: activeSubscribers[i]._id,
                menu_id: menu._id,
                week_of: weeks[j],
                items: subItems,
              };

              const subOrder = autoinsertSubscriberOrder.call(data);
              console.log(4);
              futureOrders.push(subOrder);
            };
          };
        });          
      };
    };

    // console.log(orders.length + " orders");
  },
});