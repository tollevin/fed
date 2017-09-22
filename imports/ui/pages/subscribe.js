import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import { Accounts } from 'meteor/accounts-base';
import moment from 'moment';
// import { HTTP } from 'meteor/http';

import { Orders } from '../../api/orders/orders.js';
import { Promos } from '../../api/promos/promos.js';

import { updateOrder } from '../../api/orders/methods.js';
import { 
  yesZips,
  MH,
  MH_20
} from '../../api/delivery/zipcodes.js';


import './subscribe.html';
import '../components/trial-signup.js';
import '../components/loader.js';

Template.Subscribe.onCreated(function freeTrialOnCreated() {
  this.userHasPromo = new ReactiveVar(false);

  this.autorun(() => {
    this.subscribe('thisUserData');

    // if (Meteor.user() && Meteor.user().plan) {
    //   FlowRouter.go('/my-account');
    // };
  });

	Session.set('cartOpen', false);
  Session.set('stage', 0);
  Session.setDefault('formData', {});
  Session.set('loading', false);
});

Template.Subscribe.onRendered(function freeTrialOnRendered() {
  // Stripe.setPublishableKey('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
  Stripe.setPublishableKey('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');
});

Template.Subscribe.helpers({
  loading() {
    return Session.get('loading');
  },

  trialable() {
    return Meteor.userId();
  },

  currentForm(thisForm) {
    var cf;
    switch (Session.get('stage')) {
      case 0:
        var cf = 'diet';
        break;
      case 1:
        var cf = 'plan';
        break;
      case 2:
        var cf = 'payment';
        break;
      case 3:
        var cf = 'delivery';
        break;
    };

    if (cf === thisForm) {
      return 'currentForm';
    };
  },

  diet() {
    return (Session.get('stage') === 0);
  },

  restrictions() {
    const allRestrictions = ['beef','chicken','fish','shellfish','eggs','dairy','peanuts','soy','gluten'];
    return allRestrictions;
  },

  plan() {
    return (Session.get('stage') === 1);
  },

  payment() {
    return (Session.get('stage') === 2);
  },

  delivery() {
    return (Session.get('stage') === 3);
  },

  havePromo() {
    return Template.instance().userHasPromo.get();
  },
});

Template.Subscribe.events({

  'click .enterPromo'(event,template) {
    event.preventDefault();

    Template.instance().userHasPromo.set(true);
  },

  'click #promoSub'(event, template) {
    event.preventDefault();
    Session.set('loading', true);
    var formdata = Session.get('formData');
    formdata.account_balance = 0;

    const code = template.find('[id="promo"]').value.toUpperCase();
    template.subscribe('single.promo', code, {
      onReady: function () {
        Session.set('newUser', false);

        const promo = Promos.findOne({code: code});
        
        if (promo && !promo.active) {
          sAlert.error('Sorry, that code is no longer valid.');
          formdata.account_balance = 0;
          Session.set('formData', formdata);
        } else if (promo && promo.credit) {
          var credit = 0 - (promo.credit * 100);
          formdata.account_balance = credit;
          Session.set('formData', formdata);
          sAlert.success('You now have a credit of $' + promo.credit.toFixed(2) + ".");
        } else {
          formdata.account_balance = 0;
          Session.set('formData', formdata);
          sAlert.error("Sorry, that code doesn't work for subscriptions!");
        };
      },
      onError: function () {
        sAlert.error("Sorry, that code isn't recognized");
        formdata.account_balance = 0;
        Session.set('formData', formdata);
      },
    });

    Session.set('loading', false);
    template.userHasPromo.set( false );
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
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        break;
      case 'Vegetarian':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .peanuts, .soy');
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
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .peanuts, .soy');
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
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .peanuts, .soy');
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
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
        };
        var noNos = template.findAll('#dairy');
        for (var i = noNos.length - 1; i >= 0; i--) {
          noNos[i].classList.add('checked');
        };
        var noSigns = template.findAll('.dairy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.add('fadeIn');
        };
        break;
      case 'High_Protein':
        var allNos = template.findAll('#beef, #chicken, #fish, #shellfish, #dairy, #eggs, #gluten, #peanuts, #soy');
        for (var i = allNos.length - 1; i >= 0; i--) {
          allNos[i].classList.remove('checked');
        };
        var noSigns = template.findAll('.beef, .chicken, .fish, .shellfish, .dairy, .eggs, .gluten, .peanuts, .soy');
        for (var i = noSigns.length - 1; i >= 0; i--) {
          noSigns[i].classList.remove('fadeIn');
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

  'click #next0'(event,template) {
    event.preventDefault();
    Session.set('loading', true);

    var formdata = Session.get('formData');
    var diet = template.find('.clicked');
    
    if (!diet) {
      sAlert.error("Please choose a type of diet.");
      Session.set('loading', false);
    } else {
      formdata.diet = diet.innerText;
      var restrictions = template.findAll('.checked');
      formdata.restrictions = [];
      for (var i = restrictions.length - 1; i >= 0; i--) {
        formdata.restrictions.push(restrictions[i].id);
      };

      Session.set('formData', formdata);
      Session.set('loading', false);
      Session.set('stage', 1);
    };
  },

  'click #Plan li'(event, template) {

    const plans = template.findAll("#Plan li");
    for (var i = plans.length - 1; i >= 0; i--) {
      plans[i].classList.remove('chosen');
    };
    event.currentTarget.classList.add('chosen');
    const checked = event.currentTarget.firstElementChild.checked;
    event.currentTarget.firstElementChild.checked = true;
  },

  'click #DeliveryDay li'(event, template) {

    const times = template.findAll("#DeliveryDay li");
    for (var i = times.length - 1; i >= 0; i--) {
      times[i].classList.remove('best');
    };
    event.currentTarget.classList.add('best');
    event.currentTarget.firstElementChild.checked = true;
  },

  'click #next1'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var plan = false;
    var preferredDelivDay = false;

    if (document.querySelector('input[name="plan"]:checked')) {
      plan = document.querySelector('input[name="plan"]:checked').value;
    };

    if (document.querySelector('input[name="delivery"]:checked')) {
      preferredDelivDay = document.querySelector('input[name="delivery"]:checked').value;
    };
    
    if ( plan && preferredDelivDay ) {
      var formdata = Session.get('formData');
      formdata.plan = plan;
      formdata.preferredDelivDay = preferredDelivDay;
      Session.set('formData', formdata);
      Session.set('loading', false);
      Session.set('stage', 2);

      var zip = Meteor.user().address_zipcode;
      if (!zip) {
        zip = Meteor.user().profile.zipCode;
      };

      var data = { customer_zipcode: zip };
            
      Meteor.call( 'createDelivEstimate', data, ( error, response ) => {
        if ( error ) {
          sAlert.error(error);
        } else {
          Session.set('delivEstimate', response);
        };
      });
    } else {
      Session.set('loading', false);
      if (plan) {
        sAlert.error("Please choose a delivery day");
      } else {
        sAlert.error("Please choose a plan");
      };
    }
  },

  'click #next2'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var formdata = Session.get('formData');
    Stripe.card.createToken({
      number: $('#cc').val(),
      cvc: $('.cvc').val(),
      exp_month: $('#expM').val(),
      exp_year: $('#expY').val(),
      address_zip: Meteor.user().address_zipcode,
    }, ( status, response ) => {
      if ( response.error ) {
        $('#cc-form').find('.card-errors').text(response.error.message);
        Session.set('loading', false);
      } else {
        var token = response.id;
        formdata.email = Meteor.user().emails[0].address;

        const cust = {
          description: "Customer for " + formdata.email,
          source: token,
          email: formdata.email,
          account_balance: formdata.account_balance || 0,
        };

        const custId = Meteor.call( 'createCustomer', cust, ( error, response ) => {
          if ( error ) {
            console.log(error);
          } else {
            formdata.stripe_id = response.id;
            Session.set('formData', formdata);
            Session.set('loading', false);
            Session.set('stage', 3);
          };
        });
      };
    });
  },

  'submit #DeliveryForm'(event,template) {
    event.preventDefault();
    // var f = template.find('#DeliveryForm');
    // if(f.checkValidity()) {
    Session.set('loading', true);

    var formdata = Session.get('formData');
    formdata.first_name = template.find('[name="customer.firstName"]').value;
    formdata.last_name = template.find('[name="customer.lastName"]').value;
    formdata.phone = template.find('[name="customer.phone"]').value;
    formdata.email = template.find('[name="customer.email"]').value;
    formdata.address_line_1 = template.find('[name="customer.address.line1"]').value;
    formdata.address_line_2 = template.find('[name="customer.address.line2"]').value;
    formdata.address_city = template.find('[name="customer.address.city"]').value;
    formdata.address_state = template.find('[name="customer.address.state"]').value;
    formdata.address_zipcode = template.find('[name="customer.address.zipCode"]').value;
    formdata.comments = template.find('[name="destinationComments"]').value;

    const packPrefix = formdata.plan.split("-")[0] + "PP";
    var packSuffix = "";

    if(MH.indexOf(formdata.address_zipcode) > -1) {
      packSuffix = "MH";
    };
    if (MH_20.indexOf(formdata.address_zipcode) > -1) {
      packSuffix = "MH20";
    };

    formdata.planCode = packPrefix + packSuffix;

    const today = new moment();
    var nextThursday;
    if (today.day() < 4) {
      nextThursday = 4 - today.day();
    } else {
      nextThursday = 11 - today.day();
    };

    const sub = {
      customer: formdata.stripe_id,
      plan: formdata.planCode,
      trial_period_days: nextThursday,
      tax_percent: 8.875,
      coupon: "Sub5"
    };

    Meteor.call( 'subscribeCustomer', sub, (err, response) => {
      if ( err ) {
        sAlert.error(err);
        Session.set('loading', false);
      } else {
        formdata.subscriptions = response;

        const delivCustomer = {
          first_name: formdata.first_name,
          last_name: formdata.last_name,
          email: formdata.email,
          phone: formdata.phone,
          address_line_1: formdata.address_line_1,
          address_line_2: formdata.address_line_2,
          address_city: formdata.address_city,
          address_state: formdata.address_state,
          address_zipcode: formdata.address_zipcode,
        };
        
        const packages = [{
          name: "Fed " + formdata.diet + " " + packPrefix + "-Pack",
          price: 85,
          height: 12,
          width: 14,
          depth: 10,
        }];

        if (formdata.preferredDelivDay === "monday") {
          var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
        } else {
          var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
        };

        const orderNo = new Date().toISOString().slice(5,10);

        const delivRequest = {
          "order_reference": orderNo,
          "customer": delivCustomer,
          "packages": packages,
          "delivery_window_id": delivery_window,
          "destination_comments": formdata.comments,
        };

        Meteor.call( 'createDelivery', delivRequest, ( error, response ) => {
          if ( error ) {
            $('[class="info-errors"]').text(error.reason);
            sAlert.error(error);
            console.log(error);
            Session.set('loading', false);
          } else {
            const last_purchase = response;
            const amount_spent = 0;

            const user = {
              "first_name": formdata.first_name,
              "last_name": formdata.last_name,
              "email": formdata.email,
              "phone": formdata.phone,
              "address_line_1": formdata.address_line_1,
              "address_line_2": formdata.address_line_2,
              "address_city": formdata.address_city,
              "address_state": formdata.address_state,
              "address_zipcode": formdata.address_zipcode,
              "deliv_comments": formdata.comments,
              "amount_spent": amount_spent,
              "last_purchase": last_purchase,
              "diet": formdata.diet,
              "restrictions": formdata.restrictions,
              "stripe_id": formdata.stripe_id,
              "preferredDelivDay": formdata.preferredDelivDay,
              "subscriptions": formdata.subscriptions,
              "coupon": "Sub10",
              "pack": packPrefix
            };

            Meteor.call( 'updateSubscriber', Meteor.userId(), user, ( error, response ) => {
              if ( error ) {
                sAlert.error(error);
                console.log(error);
                Session.set('loading', false);
              // } else {
                // var orderToProcess = Session.get('orderId');
                // orderToProcess.readyBy = delivery_window.starts_at;
                // orderToProcess.deliv_day = delDay;
                // orderToProcess.coupon = Session.get('promo');
                // orderToProcess.deliv_id = last_purchase.id;
                // orderToProcess.trackingCode = last_purchase.tracking_code;

                // const orderToProcess = {
                //   _id: Se,
                //   packName: { type: String, optional: true },
                //   packPrice: { type: Number, optional: true },
                //   packDishes: { type: [ String ] },
                //   'packDishes.$': { type: String },
                //   packSnacks: { type: [ String ] },
                //   'packSnacks.$': { type: String },
                //   status: { type: String },
                //   coupon: { type: String, optional: true },
                //   deliveryWindow: { type: String, optional: true },
                //   destinationComments: { type: String, optional: true },
                //   deliveredAt: { type: String, optional: true },
                //   trackingCode: { type: String, optional: true },
                //   paidAt: { type: String, optional: true },
                //   readyBy: { type: String, optional: true },
                //   deliv_id: { type: String, optional: true },
                //   deliv_day: { type: String, optional: true },
                //   stripe_id: { type: String, optional: true },
                // };

                // const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
                //   if ( error ) {
                //     console.log(error);
                //   } else {
                //     analytics.track('Order Completed', {
                //       checkoutId: last_purchase.tracking_code,
                //       orderId: response.id,
                //       affiliation: 'Getfednyc.com',
                //       total: finalPrice,
                //       revenue: parseFloat(Session.get('salePrice').toFixed(2)),
                //       shipping: parseFloat(Session.get('delivFee').toFixed(2)),
                //       tax: parseFloat((Session.get('salePrice') * .08875).toFixed(2)),
                //       discount: Session.get('price') - Session.get('salePrice'),
                //       coupon: promo,
                //       currency: 'USD',
                //       products: [
                //         {
                //           name: orderToProcess.description,
                //           price: parseFloat(Session.get('price').toFixed(2)),
                //           quantity: 1,
                //         },
                //       ]
                //     });
                //   };
              //   });
              };
            });
            Session.set('loading', false);
            sAlert.success("All done! We'll email you soon with details about your subscription.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});
          };
        });
      };
    });
  return false;
  },
});