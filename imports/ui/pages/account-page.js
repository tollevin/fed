import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import moment from 'moment';
// import { HTTP } from 'meteor/http';
import { Orders } from '../../api/orders/orders.js';
import {
	updateOrder
} from '../../api/orders/methods.js';


import './account-page.html';

import '../components/payment-settings.js';
import '../components/pack-settings.js';

Template.Account_page.onCreated(function accountPageOnCreated() {
	this.autorun(() => {
    var subs = this.subscribe('thisUserData');

    if(!Meteor.userId()){
  		FlowRouter.go('/signin');
  	} else {
      if (subs.ready()) {
        const stripe_id = Meteor.user().stripe_id;
        //If user has a stripe_id, retrieve their customer info from Stripe
        if (stripe_id) {
          Meteor.call( 'retrieveCustomer', stripe_id, (err, response) => {
            if ( err ) {
              console.log(err);
            } else {
              //Set stripe_customer info to a Session var
              Session.setDefault("stripe_customer", response);
              //Figure out if a user is currently skipping (REDUNDANT post cron)
              if (Meteor.user().skipping) {
                var skippingTil = Meteor.user().skipping.slice(6,);
                if (moment().unix() > moment(skippingTil, "MM-DD-YYYY").subtract(7, 'd').unix()) {
                  var skipping = false;
                  Meteor.user().skipping = false;
                } else {
                  var skipping = true;
                }
              } else {
                var skipping = false;
              };
              Session.setDefault('skipping', skipping);
              //If user's subscription start matches the start of their current billing period, set them as 'trialing' (new customer)
              if (response.subscriptions.data.created === response.subscriptions.data.current_period_start) {
                Session.set('trial', true);
              };
            };
          });
        };
      };
    };
  });

	Session.set('cartOpen', false);
  Session.set('stage', 0);
});

Template.Account_page.onRendered(function accountPageOnRendered() {
  // stripe.setPublishableKey('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
  // stripe.setPublishableKey('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');
  // const stripe = Stripe('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
  // const stripe = Stripe('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');
});

Template.Account_page.helpers({
  forward() {
    return !(Session.get('stage') === 0);
  },

  settingsMenu() {
    return Session.get('stage') === 0;
  },

  pack() {
    return Session.get('stage') === 1;
  },

  delivery() {
    return Session.get('stage') === 2;
  },

  payment() {
    return Session.get('stage') === 3;
  },

  skipper() {
    return Session.get('stage') === 4;
  },

  unsub() {
    return Session.get('stage') === 5;
  },

  subscribed() {
    return Meteor.user().subscriptions && Meteor.user().subscriptions.status != 'canceled'; // FIX!!!!
  },

  first_name() {
    return Meteor.user().first_name;
  },

  last_name() {
    return Meteor.user().last_name;
  },

  phone() {
    return Meteor.user().phone;
  },

  email() {
    return Meteor.user().emails[0].address;
  },

  address1() {
    return Meteor.user().address_line_1;
  },

  address2() {
    return Meteor.user().address_line_2;
  },

  city() {
    return Meteor.user().address_city;
  },
  
  zip() {
    return Meteor.user().address_zipcode;
  },

  comments() {
    return Meteor.user().deliv_comments;
  },

  cardNo() {
    return "************" + Session.get('stripe_customer').sources.data[0].last4;
  },

  nextDeliv() {
    if (Meteor.user().subscriptions.status === "trialing") {
      const trial_end = Meteor.user().subscriptions.trial_end;
      const delDay = Meteor.user().preferredDelivDay;
      if (delDay === "sunday") {
        var toAdd = 3;
      } else {
        var toAdd = 4;
      };
      var nextDelivTime = (trial_end * 1000) + (toAdd * 24 * 60 * 60 * 1000);
      var nextDeliv = new Date(nextDelivTime).toLocaleDateString();
      return delDay.charAt(0).toUpperCase() + delDay.slice(1) + ", " + nextDeliv;
    } else if (Meteor.user().subscriptions.status === "active") {
      const delDay = Meteor.user().preferredDelivDay;
      if (delDay === "sunday") {
        var dy = 0;
      } else {
        var dy = 1;
      };
      const now = new moment();
      // if (now.day() === 0) {
      //   if (dy === 0) {
      //     return "Tonight,";
      //   } else {
      //     return "Tomorrow,";
      //   };
      // } else if (now.day() === 1 && dy === 1) {
      //   return "Tonight,";
      // } else {
        return now.day(dy + 7).format("dddd, M/D/YY")
      // };
    };
  },

  skipping() {
    return Session.get('skipping');
  },

  beforeThurs() {
    const now = moment();
    if (now.day() < 4) {
      return true;
    } else {
      return false;
    };
  },
});

Template.Account_page.events({
  'click #Plan li label'(event, template) {

    const plans = template.findAll("#Plan li");
    plans[0].style.borderColor = "#034b2c";
    plans[1].style.borderColor = "#034b2c";
    plans[2].style.borderColor = "#034b2c";
    plans[3].style.borderColor = "#034b2c";
    plans[0].style.backgroundColor = "transparent";
    plans[1].style.backgroundColor = "transparent";
    plans[2].style.backgroundColor = "transparent";
    plans[3].style.backgroundColor = "transparent";
    event.target.closest( "li" ).style.borderColor = "#fff";
    event.target.closest( "li" ).style.backgroundColor = "#fff";
  },

  'click .diet label, touchstart .diet label'(event, template) {
    event.preventDefault();

    const diets = template.findAll('.diet > label');
    for (var i = diets.length - 1; i >= 0; i--) {
      diets[i].classList.remove('clicked')
    };

    event.currentTarget.classList.add('clicked');

    switch (event.target.closest("li").id) {
      case 'Omnivore':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #nuts, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .nuts, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        break;
      case 'Vegetarian':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #nuts, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .nuts, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        var noNos = template.findAll('#beef, #chicken, #fish, #shellfish');
        for (var i = noNos.length - 1; i >= 0; i--) {
          noNos[i].classList.add('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.add('fadeIn');
        };
        break;
      case 'Vegan':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #nuts, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .nuts, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        var noNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs');
        for (var i = noNos.length - 1; i >= 0; i--) {
          noNos[i].classList.add('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.add('fadeIn');
        };
        break;
      case 'Pescetarian':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #nuts, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .nuts, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        var noNos = template.findAll('#beef, #chicken');
        for (var i = noNos.length - 1; i >= 0; i--) {
          noNos[i].classList.add('checked');
        };
        var noSigns = template.findAll('.beef, .chicken');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.add('fadeIn');
        };
        break;
      case 'Paleo':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #nuts, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .nuts, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        var noNos = template.findAll('#dairy, #soy');
        for (var i = noNos.length - 1; i >= 0; i--) {
          noNos[i].classList.add('checked');
        };
        var noSigns = template.findAll('.dairy, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.add('fadeIn');
        };
        break;
    };
  },

  'click .restriction'(event, template) {
    event.preventDefault();

    event.currentTarget.classList.toggle('checked');

    const itemClass = "." + event.currentTarget.id;
    const imgs = template.findAll(itemClass);
    for (var i = imgs.length - 1; i >= 0; i--) {
      imgs[i].classList.toggle('fadeIn');
    };
  },

  'click #DeliveryDay li label'(event, template) {
    const delivery = template.findAll("#DeliveryDay li");
    delivery[0].style.borderColor = "#034b2c";
    delivery[1].style.borderColor = "#034b2c";
    delivery[0].style.backgroundColor = "transparent";
    delivery[1].style.backgroundColor = "transparent";
    event.target.closest( "li" ).style.borderColor = "#fff";
    event.target.closest( "li" ).style.backgroundColor = "#fff";
  },

  'click #Sub' (event) {
    event.preventDefault();

    FlowRouter.go('/subscribe');
  },

  'click #Pset'(event, template) {
    event.preventDefault();
    // var currentDiet = Meteor.user().diet;
    // const diets = document.querySelector('#Diet li');

    // console.log(diets);
    // if (currentDiet === 'omnivore') {
    //   diets[0].style.borderColor = "#007444";
    // } else {
    //   diets[1].style.borderColor = "#007444";
    // };
    Session.set('stage', 1);
  },
    
  'click #Dset'(event) {
    event.preventDefault();
    Session.set('stage', 2);
  },
    
  'click #Payset'(event) {
    event.preventDefault();
    Session.set('stage', 3);
  },

  'click #Back'(event) {
    event.preventDefault();
    Session.set('stage', 0);
  },
    
  'click .sbmtPack'(event) {
    event.preventDefault();
    Session.set('loading', true);

    var formdata = {};
    if (document.querySelector('input[name="plan"]:checked').value) formdata.plan = document.querySelector('input[name="plan"]:checked').value;
    if (document.querySelector('input[name="diet"]:checked').value) formdata.plan = document.querySelector('input[name="diet"]:checked').value;
    if (document.querySelector('input[name="delivery"]:checked').value) formdata.preferredDelivDay = document.querySelector('input[name="delivery"]:checked').value;
    var restrictions = template.findAll('.checked');
      formdata.restrictions = [];
      for (var i = restrictions.length - 1; i >= 0; i--) {
        formdata.restrictions.push(restrictions[i].id);
      };
    const user = formdata;

    Meteor.call( 'updateUser', Meteor.userId(), user, ( error, response ) => {
      if ( error ) {
        console.log(error + "; error");
      } else {
        console.log(response);
      };
    });
    sAlert.success("Settings saved!");
    Session.set('stage', 0);
    Session.set('loading', false);

  },

  'submit #DeliveryForm'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var formdata = {};
    if (template.find('[name="customer.firstName"]').value) formdata.first_name = template.find('[name="customer.firstName"]').value;
    if (template.find('[name="customer.lastName"]').value) formdata.last_name = template.find('[name="customer.lastName"]').value;
    if (template.find('[name="customer.phone"]').value) formdata.phone = template.find('[name="customer.phone"]').value;
    if (template.find('[name="customer.email"]').value) formdata.email = template.find('[name="customer.email"]').value;
    if (template.find('[name="customer.address.line1"]').value) formdata.address_line_1 = template.find('[name="customer.address.line1"]').value;
    if (template.find('[name="customer.address.line2"]').value) formdata.address_line_2 = template.find('[name="customer.address.line2"]').value;
    if (template.find('[name="customer.address.city"]').value) formdata.address_city = template.find('[name="customer.address.city"]').value;
    if (template.find('[name="customer.address.state"]').value) formdata.address_state = template.find('[name="customer.address.state"]').value;
    if (template.find('[name="customer.address.zipCode"]').value) formdata.address_zipcode = template.find('[name="customer.address.zipCode"]').value;
    if (template.find('[name="destinationComments"]').value) formdata.comments = template.find('[name="destinationComments"]').value;
    const user = formdata;

    Meteor.call( 'updateUser', Meteor.userId(), user, ( error, response ) => {
      if ( error ) {
        console.log(error + "; error");
      } else {
        sAlert.success('Delivery settings updated!');
        Session.set('stage', 0);
      };
    });
    Session.set('loading', false);
  },

  // 'click .sbmtSource'(event) {
  //   event.preventDefault();
  //   Session.set('loading', true);

  //   stripe.card.createToken({
  //     number: $('#cc').val(),
  //     cvc: $('.cvc').val(),
  //     exp_month: $('#expM').val(),
  //     exp_year: $('#expY').val(),
  //     address_zip: Meteor.user().address_zipcode,
  //   }, ( status, response ) => {
  //     if ( response.error ) {
  //       $('#cc-form').find('.card-errors').text(response.error.message);
  //       Session.set('loading', false);
  //     } else {
  //       const token = response.id;

  //       if (Meteor.user().stripe_id) {
  //         const _id = Meteor.user().stripe_id;
  //         const args = {
  //           default_source: token
  //         };

  //         Meteor.call( 'updateCustomer', _id, args, ( error, response ) => {
  //           if ( error ) {
  //             console.log(error + "; error");
  //           } else {
  //             sAlert.success("Card added!");
  //           };
  //         });

  //         Session.set('stage', 0);
  //         Session.set('loading', false);
  //       } else {
  //         var userEmail = "";
  //         if (Meteor.user().profile) {
  //           userEmail = Meteor.user().emails[0].address;
  //         } else {
  //           userEmail = Meteor.user().email;
  //         }

  //         const cust = {
  //           description: "Customer for " + userEmail,
  //           source: token,
  //           account_balance: 0
  //         };

  //         Meteor.call( 'createCustomer', cust, ( error, response ) => {
  //           if ( error ) {
  //             console.log(error + "; error");
  //           } else {
  //             const user = {
  //               "stripe_id": response.id,
  //             };

  //             Meteor.call( 'updateUser', Meteor.userId(), user );
  //             sAlert.success('Payment settings updated!');
  //           };
  //         });

  //         sAlert.success("Card added!");
  //         Session.set('stage', 0);
  //         Session.set('loading', false);
  //       };
  //     };
  //   });
  // },

  'click #skipWeek'(event) {
    event.preventDefault();
    Session.set('stage', 4);
  },

  'click #skip'(event) {
    event.preventDefault();

    const subscriptionId = Meteor.user().subscriptions.id;

    var now = moment().unix();
    var thisThursdayTime = moment().day(4).hours(0).minutes(0).seconds(0).unix();
    if (now < thisThursdayTime) {
      var nextThursdayTime = moment().day(11).hours(0).minutes(0).seconds(0).unix();
    };

    const args = {
      subscription_id: subscriptionId,
      trial_end: nextThursdayTime,
      prorate: false,
    };

    Meteor.call( 'updateSubscription', args, ( error, response ) => {
      if ( error ) {
        console.log(error + "; error");
      } else {
        const user = Meteor.user();
        user.subscriptions = response;
        user.skipping = "Until " + new moment(nextThursdayTime * 1000).format("MM/DD/YY");
        Meteor.call( 'updateUser', Meteor.userId(), user );
        Session.set('skipping', true);
      };
    });
  },

  'click #unskip'(event) {
    event.preventDefault();

    const subscriptionId = Meteor.user().subscriptions.id;

    var now = moment().unix();
    var thisThursdayTime = moment().day(4).hours(0).minutes(0).seconds(0).unix();
    if (now < thisThursdayTime) {
      var comingThursdayTime = moment().day(4).hours(0).minutes(0).seconds(0).unix();
    }; // } else {
    //   var comingThursdayTime = moment().day(4 + 7).hours(0).minutes(0).seconds(0).unix();
    // };

    const args = {
      subscription_id: subscriptionId,
      trial_end: comingThursdayTime,
      prorate: false,
    };

    Meteor.call( 'updateSubscription', args, ( error, response ) => {
      if ( error ) {
        console.log(error + "; error");
      } else {
        const user = Meteor.user();
        user.subscriptions = response;
        user.skipping = false;

        Meteor.call( 'updateUser', Meteor.userId(), user );
        Session.set('skipping', false)
      };
    });
  },

  'click #Unsub'(event) {
    Session.set('stage', 5);
  },

  'click #Unsubscribe'(event) {
    event.preventDefault();

    const customerId = Meteor.user().stripe_id;
    const subscriptionId = Meteor.user().subscriptions.id;

    Meteor.call( 'cancelSubscription', subscriptionId, ( error, response ) => {
      if ( error ) {
        console.log(error + "; error");
      } else {
        const user = Meteor.user();
        user.subscriptions = response;

        Meteor.call( 'updateUser', Meteor.userId(), user );
        sAlert.success('You have been unsubscribed. We hope to see you again soon!');
        FlowRouter.go('/');
      };
    });
  },
});