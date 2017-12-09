import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import moment from 'moment';

// import { HTTP } from 'meteor/http';
import { Orders } from '../../api/orders/orders.js';
import { Promos } from '../../api/promos/promos.js';
// Zip Codes
import { 
  yesZips,
  MH,
  MH_20
} from '../../api/delivery/zipcodes.js';

import {
  updateOrder
} from '../../api/orders/methods.js';

import {
  usePromo
} from '../../api/promos/methods.js';

import './checkout-page.html';

// components
import '../components/loader.js';
import '../components/stripe-card-element.js';

Template.Checkout_page.onCreated(function checkoutPageOnCreated() {
  // Create a handle for subscription to this 'single.order', 'thisUserData'
  if (Session.get('orderId')) {
    const handle = this.subscribe('single.order', Session.get('orderId')._id);
    const thisUserData = this.subscribe('thisUserData', Meteor.userId());

    // Set initial Session variables
    Session.set('cartOpen', false);
    Session.set('loading', false);

    // Set default variables for template
    this.price = Session.get('pack').price / 100;

    // Set reactive variables for template
    this.discount = new ReactiveVar(0);
    this.discountPercent = new ReactiveVar(0);
    this.discountValue = new ReactiveVar(false);
    this.userHasCredit = new ReactiveVar(0);
    this.appliedCredit = new ReactiveVar(0);
    this.zipField = new ReactiveVar(Meteor.user().address_zipcode);
    this.userHasPromo = new ReactiveVar(false);
    this.order = new ReactiveVar(Session.get('orderId'));
    this.order.coupon = new ReactiveVar( false );
    this.order.total = new ReactiveVar();  
    this.order.subtotal = new ReactiveVar();
    this.delivFee = new ReactiveVar(0);
    this.sources = new ReactiveVar(false);
    this.isNotSubscriber = true;

    // for GUEST USERS and LOGGED IN USERS who haven't yet purchased, activate 2MEALSFREE initial deal
    // if (Session.get('newUser')) {
    //   this.order.coupon.set("2MEALSFREE");
    //   var percentOff = ()=> {
    //     switch (this.price) {
    //       case 85:
    //         return 34;
    //         break;
    //       case 110:
    //         return 26;
    //         break;
    //       case 135:
    //         return 20;
    //         break;
    //       case 159:
    //         return 18;
    //         break;
    //     };
    //   };
    //   this.discountPercent.set( this.price * percentOff() / 100 );
    //   this.discountValue.set( "2 Meals FREE!" );
    // };

    // All reactive data for autorun
    this.autorun(() => {

      const isReady = handle.ready();
      if (isReady) {

        // if USER is LOGGED IN
        if (thisUserData.ready()) {
          if (Meteor.userId()) {

            // If the customer has a Stripe ID, we attach it to the template and call a list of their payment sources
            if (!this.stripe_id && Meteor.user().stripe_id) {
              this.stripe_id = Meteor.user().stripe_id;
              // Call stripe user info
              Meteor.call( 'retrieveCustomer', this.stripe_id, (error, response) => {
                if (error) {
                  console.log(error);
                } else {
                  this.stripeCustomer = response;
                  this.sources.set(this.stripeCustomer.sources);
                };
              });
            };

            // Set Subscriber Discount
            if (Meteor.user().subscriptions && ['active', 'trialing'].indexOf(Meteor.user().subscriptions.status) > -1) {
              this.isNotSubscriber = false;
              var percentOff = Meteor.user().subscriptions.discount.coupon.id.split("b")[1];
              // if (percentOff[0] === "-") {
              //   this.discount.set( percentOff.split("-")[1] );
              //   this.discountValue.set( "- $" + discount.toFixed(2) + " \u2665" );
              // } else {
                this.discountPercent.set( this.price * Number(percentOff) / 100 );
                this.discountValue.set( percentOff + "% \u2665" );
              // };
            };

            // Set if user has a credit on account
            if (Meteor.user().credit > 0) {
              const credit = Meteor.user().credit;
              this.userHasCredit.set(credit);
            };
          } else {
            FlowRouter.go('/');
          };        
        };
      };

      // Reactive vars to be autorun
      this.order.subtotal.set( this.price - this.discountPercent.get() );

      if (MH.indexOf(this.zipField.get()) > -1) {
        this.delivFee.set(13);
      };
      if (MH_20.indexOf(this.zipField.get()) > -1) {
        this.delivFee.set(20);
      };

      this.order.total.set(( this.order.subtotal.get() * 1.08875 ) + this.delivFee.get() - this.discount.get());
      
      // if (this.order.total.get() < 0) {
      //   const credit = 0 - this.order.total.get();
      //   this.order.total.set(0);
      //   this.userHasCredit.set(credit + Meteor.user().credit);
      // };
    });
  } else {
    sAlert.error("Sorry, your order got tossed! Redirecting you home...", { timeout: 3000, onClose: function() { FlowRouter.go('/'); }});
  };
});

Template.Checkout_page.onRendered(function checkoutPageOnRendered() {
  // // Set Stripe Public Key
  // stripe = Stripe('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
  // // stripe = Stripe('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');
  // // Set Stripe Elements to element var
  // elements = stripe.elements();
  // // Create an instance of the card Element
  // // Custom styling can be passed to options when creating an Element.
  // const style = {
  //   base: {
  //     // Add your base input styles here. For example:
  //     fontSize: '16px',
  //   },
  // };
  // card = elements.create('card', {style});

  // if (this.isNotSubscriber) {
  //   Meteor.setTimeout(()=> {
  //     card.mount('#card-element');
  //   }, 1000);
  // };
});

Template.Checkout_page.onDestroyed(function checkoutPageOnDestroyed() {
  // if (!Meteor.user().last_purchase) {
  //   Session.set('newUser', true);
  // };
});

Template.Checkout_page.helpers({
  loading() {
    return Session.get('loading');
  },

  havePromo() {
    return Template.instance().userHasPromo.get();
  },

  noCustomer() {
    return !(Template.instance().stripe_id);
  },

  stripeID() {
    return Meteor.user().stripe_id;
  },

  subscribed() {
    return Meteor.userId() && Meteor.user().subscriptions && 'subscribed';
  },

  formType() {
    if (Meteor.userId() && Meteor.user().subscriptions && (Meteor.user().subscriptions.status != 'canceled')) {
      return "insertSubscriberOrderForm";
    } else {
      return "insertOrderForm";
    };
  },

  zipCode() {
    return Template.instance().zipField.get();
  },

  first_name() {
    return Meteor.userId() && Meteor.user().first_name;
  },

  last_name() {
    return Meteor.userId() && Meteor.user().last_name;
  },

  phone() {
    return Meteor.userId() && Meteor.user().phone;
  },

  address1() {
    return Meteor.userId() && Meteor.user().address_line_1;
  },

  address2() {
    return Meteor.userId() && Meteor.user().address_line_2;
  },

  city() {
    return Meteor.userId() && Meteor.user().address_city;
  },

  comments() {
    return Meteor.userId() && Meteor.user().deliv_comments;
  },

  deliv() {
    if (Meteor.user().preferredDelivDay) {
      return Meteor.user().preferredDelivDay;
    };
  },

  nextSunday() {
    if (moment().day() === 0 && moment().hour() < 12) {
      return moment().day(0).format("dddd, MMMM Do"); // today (Sunday)
    // } else if (moment().day() === 0 && moment().hour() < 24) {
    //   return false; //show no option on sundays after noon
    } else {
      return moment().day(7).format("dddd, MMMM Do"); // next Sunday
    }; 
  },

  nextMonday() {
    if (moment().day() === 0 && moment().hour() < 12) {
      return moment().day(1).format("dddd, MMMM Do"); // this Monday (tomorrow)
    } else {
      return moment().day(8).format("dddd, MMMM Do"); // next Monday
    };
  },

  isSunOrMon() {
    return moment().day() === 0 || 1;
  },

  email() {
    return Meteor.userId() && Meteor.user().emails[0].address;
  },

  pack() {
    return Session.get('pack').description;
  },

  packItems() {
    var dishList = Session.get('pack').dishes;
    var dishTally = {};
    for (var i = dishList.length - 1; i >= 0; i--) {
      if (dishList[i] != '' && !dishTally[dishList[i]]) {
        dishTally[dishList[i]] = 1;
      } else if (dishList[i] != '') {
        dishTally[dishList[i]] += 1;
      };
    };
    var snackList = Session.get('pack').snacks;
    var snackTally = {};
    for (var i = snackList.length - 1; i >= 0; i--) {
      if (snackList[i] != '' && !snackTally[snackList[i]]) {
        snackTally[snackList[i]] = 1;
      } else if (snackList[i] != '') {
        snackTally[snackList[i]] += 1;
      };
    };
    var result = [];
    for (var key in dishTally) result.push({name:key,value:dishTally[key]});
    for (var key in snackTally) result.push({name:key,value:snackTally[key]});
    return result;
  },

  dishes() {
    if (Session.get('pack')) {
      var dishList = Session.get('pack').dishes;
      var dishTally = {};
      for (var i = dishList.length - 1; i >= 0; i--) {
        if (dishList[i] != '' && !dishTally[dishList[i]]) {
          dishTally[dishList[i]] = 1;
        } else if (dishList[i] != '') {
          dishTally[dishList[i]] += 1;
        };
      };
      console.log(dishTally);
      var result = [];
      for (var key in dishTally) result.push({name:key,value:dishTally[key]});
      return result;
    };
  },


  deliveryFee() {
    return "$" + Template.instance().delivFee.get();
  },

  price() {
    return "$" + Template.instance().order.subtotal.get().toFixed(2);
  },

  tax() {
    return "$" + (Template.instance().order.subtotal.get() * .08875).toFixed(2);
  },

  // coupon() {
  //   return Template.instance().order.coupon.get();
  // },

  discount() {
    return Template.instance().discountValue.get();
  },

  userHasCredit() {
    if(Template.instance().userHasCredit.get() && !(Template.instance().appliedCredit.get())) {
      return "$" + Template.instance().userHasCredit.get().toFixed(2);
    } else {
      return false;
    }
  },

  total() {
    return "$" + Template.instance().order.total.get().toFixed(2);
  },

  sources() {
    return Template.instance().sources.get();
  },

  formSubmitButtonText() {
    if (Meteor.userId() && Meteor.user().subscriptions && (Meteor.user().subscriptions.status != 'canceled')) {
      return "Save";
    } else {
      return "Buy";
    };
  },

  disabled() {
    return Session.get('loading') && "disabled";
  },
});

Template.Checkout_page.events({
  'click .enterPromo' (event) {
    event.preventDefault();

    Template.instance().userHasPromo.set(true);
  },

  'change #r6HB6YfaegNsAKBTS'(event, template) {
    event.preventDefault();

    const newZip = event.target.value;
    template.zipField.set(newZip);
  },

  'change #EsBbF9Ads8fEFFAut'(event, template) {
    event.preventDefault();

    if (!Meteor.user()) {
      const email = event.target.value;
      
      Meteor.call('checkUserHasPurchased', email, ( error, response ) => {
        if ( error ) {
          console.log(error);
        } else {
          if (response) {
            template.order.coupon.set( false );
            template.discount.set(0);
            template.discountValue.set( false );
            sAlert.error("Your email address already exists in our system.");
          };
        }; 
      });
    };
  },

  'click #promoSub'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    const code = template.find('[id="promo"]').value.toUpperCase();
    const user = Meteor.userId();
    template.subscribe('single.promo', code, {
      onReady: function () {
        Session.set('newUser', false);
        // template.order.coupon.set( false );
        // template.order.subtotal.set( template.price );
        // template.order.total.set((template.order.subtotal.get() * 1.08875 ) + template.delivFee.get());
        // template.discount.set( 0 );
        // template.discountPercent.set( 0 );
        // template.discountValue.set( false );

        const promo = Promos.findOne({code: code});
        const origPriceWTax = Math.round(template.price * 108.875) / 100;
        
        if (promo && !promo.active) {
          sAlert.error('Sorry, that code is no longer valid.');
          template.order.coupon.set( false );
        } else if (promo.users[user] === promo.useLimitPerCustomer) {
          sAlert.error('Sorry, that code has already been used.');
          template.order.coupon.set( false );
        } else if (promo && promo.credit) {
          var total = template.order.total.get();
          var discount = promo.credit;
          template.order.coupon.set( code );
          var newTotal = total - discount;
          if (newTotal < 0) {
            const newCredit = 0 - newTotal;
            // FIX if (!Meteor.userId()) {
            template.newCredit = newCredit;
            template.discountValue.set("- $" + total.toFixed(2));
            template.discount.set( total );
            template.appliedCredit.set( total );
            sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
          } else {
            template.discount.set( discount );
            template.appliedCredit.set( discount );
            template.newCredit = 0;
            template.discountValue.set( "- $" + discount.toFixed(2) );
          };
        } else if (promo && promo.percentage) {
          template.order.coupon.set( code );
          if (code === "FED40") {
            sAlert.error("Sorry, that code only applies toward subscriptions");
            template.order.coupon.set( false );
          } else {
            var percentOff = promo.percentage;
            template.discountPercent.set( template.price * percentOff / 100 );
            template.discountValue.set( "-" + percentOff + "%" );
          };
        } else if (promo && promo.function) {
          template.order.coupon.set( code );
          if (code === "MORE4LESS") {
            var percentOff = ()=> {
              switch (template.price) {
                case 85:
                  return 34;
                  break;
                case 110:
                  return 26;
                  break;
                case 135:
                  return 20;
                  break;
                case 159:
                  return 18;
                  break;
              };
            };
            template.discount.set( template.price * percentOff() / 100 );
            template.discountValue.set( "2 Meals FREE!" );
          } else if (code === "GETMOREFED") {
            template.order.coupon.set( code );
            template.order.packDishes.push("+ 2 Chef's Plate");
            template.discountValue.set( "$0" );
            sAlert.success("Great! 2 Chef's Plates have been added to your pack!");
          };
        } else {
          sAlert.error("Sorry, that code isn't recognized");
          template.discount.set( 0 );
          template.discountValue.set( false );

          // Session.set('salePrice', Session.get('price'));
          // Session.set('discount', false);
          // var newTotal = origPriceWTax + Session.get('delivFee');
          // Session.set('total', newTotal);
        };
      },
      onError: function () {
        sAlert.error("Sorry, that code isn't recognized");
      },
    });

    Session.set('loading', false);
    template.userHasPromo.set( false );
  },

  'click #applyCredit'(event, template) {
    event.preventDefault();


    const credit = template.userHasCredit.get();
    const discount = template.discount.get();
    const total = template.order.total.get();
    var newDiscount = discount + credit;
    if (total < newDiscount) {
      const newCredit = newDiscount - total;
      template.order.coupon.set( "ACCOUNT CREDIT of" + total );
      template.discountValue.set("- $" + template.order.total.get().toFixed(2));
      template.discount.set( template.order.total.get() );
      sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
      template.appliedCredit.set(credit);
      template.newCredit = newCredit;
    } else {
      template.order.coupon.set( "ACCOUNT CREDIT OF" + credit );
      template.appliedCredit.set(credit);
      template.newCredit = 0;
      template.discountValue.set("- $" + credit);
      template.discount.set( credit );
      sAlert.success('$' + credit.toFixed(2) + " worth of FedCred has been applied!");
    };
  },

  'blur #address-zip'(event, template) {
    const value = event.currentTarget.value;
    if (yesZips.indexOf(value) < 0) {
      const errorElement = document.getElementById('zip-errors');
      errorElement.textContent = 'Sorry, but we only deliver to Brooklyn, Queens, and Manhattan at this time.';
    };
  },

  'submit #insertOrderForm'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var orderToProcess = template.order.get();
    orderToProcess.userId = Meteor.userId();
    orderToProcess.total = template.order.total.get().toFixed(2);
    orderToProcess.packName = Session.get('pack').description;
    orderToProcess.coupon = template.order.coupon.get();
    var customer = {};
    customer.first_name = template.find('[name="customer.firstName"]').value;
    customer.last_name = template.find('[name="customer.lastName"]').value;
    customer.phone = template.find('[name="customer.phone"]').value;
    customer.email = template.find('[name="customer.email"]').value;
    customer.address_line_1 = template.find('[name="customer.address.line1"]').value;
    customer.address_line_2 = template.find('[name="customer.address.line2"]').value;
    customer.address_city = template.find('[name="customer.address.city"]').value;
    customer.address_state = template.find('[name="customer.address.state"]').value;
    customer.address_zipcode = template.find('[name="customer.address.zipCode"]').value;
    orderToProcess.customer = customer;
    const comments = template.find('[name="destinationComments"]').value;
    var credit = template.userHasCredit.get();
    if (template.appliedCredit.get()) {
      credit = template.newCredit;
    } else {
      credit = template.userHasCredit.get();
    };
    var stripe_id = template.stripe_id;
    const finalPrice = Math.round(Number(orderToProcess.total) * 100);

    const callWithPromise = (method, myParameters) => {
      return new Promise((resolve, reject) => {
        Meteor.call(method, myParameters, (err, res) => {
          if (err) {
            reject(err);
          };
          resolve(res);
        });
      });
    };

    // async function createStripeToken() {
    //   try {
    //     const token = await stripe.tokens.create({
    //       card: {
    //         number: $('.number').val(),
    //         cvc: $('.cvc').val(),
    //         exp_month: $('.exp_month').val(),
    //         exp_year: $('.exp_year').val(),
    //         address_zip: customer.address_zipcode,
    //       }
    //     });
    //     return token;
    //   } catch(error) {
    //     throw new Meteor.Error(error.status)
    //   };
    // };

    async function processPromo() {
      try {
        const code = orderToProcess.coupon;
        var codeCheck = false;
        if (code) {
          usePromo.call({
            code: code
          }, (err, res) => {
            if (err) {
              return(err);
            } else {
              return(res);
            };
          });
        };
      } catch(error) {
        sAlert.error(error.reason);
      };
    };

    async function createStripeTokenFromElement() {
      try {
        var childView = Blaze.getView(template.find('#card-element'));
        var childTemplateInstance = childView._templateInstance;
        var card = childTemplateInstance.card;
        var stripe = childTemplateInstance.stripe;
        const {token, error} = await stripe.createToken(card);
        return token;
      } catch(error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      };
    };

    async function createStripeCustomer(cust) {
      try {
        const newStripeCustomer = await callWithPromise('createCustomer', cust );
        return newStripeCustomer;
      } catch(error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
    };

    async function chargeStripe(charge) {
      try {
        const newCharge = await callWithPromise( 'processPayment', charge );
        return newCharge;
      } catch(error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      };
    };

    async function processSingleOrder () {
      try {
        const codeCheck = await processPromo();

        // Make finalPrice in cents as a number from total
        let charge;

        // If user already has a Stripe customer ID
        if (stripe_id) {
          var source = template.find('[id="Source"]').value;
          charge  = {
            amount: finalPrice,
            currency: 'usd',
            customer: stripe_id,
            source: source,
            description: orderToProcess.packName + " for " + customer.first_name + " " + customer.last_name,
            receipt_email: customer.email
          };
        // Else if new customer
        } else {
          const token = await createStripeTokenFromElement();
          const cust = {
            description: "Customer for " + customer.first_name + " " + customer.last_name,
            source: token.id,
            account_balance: 0,
            email: customer.email
          };

          const newStripeCustomer = await createStripeCustomer( cust );
          stripe_id = newStripeCustomer.id;
          charge  = {
            amount: finalPrice,
            currency: 'usd',
            customer: stripe_id,
            description: orderToProcess.packName,
            receipt_email: customer.email
          };
        };

        // If final price is positive, charge stripe
        if (finalPrice > 0) {
          // Charge Stripe
          const payment = await chargeStripe( charge );
          orderToProcess.stripe_id = payment.id;
          orderToProcess.salePrice = (finalPrice / 100).toFixed(2);
        } else {
          orderToProcess.salePrice = "0";
        };

        orderToProcess.paidAt = new Date();
        orderToProcess.status = "created";
             
        const packages = [{
          name: orderToProcess.packName,
          price: template.price,
          height: 12,
          width: 14,
          depth: 10,
        }];

        var delDay = $('[name="deliveryWindow"]').val();
        // var windows = Session.get('delivEstimate');
        // if ( delDay === "Monday") {
        //   var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
        // } else {
        //   var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
        // };

        // const delivRequest = {
        //   "order_reference": Session.get('orderId')._id,
        //   "customer": customer,
        //   "packages": packages,
        //   "delivery_window_id": delivery_window,
        //   "destination_comments": comments,
        // };

        // const newDelivery = await createNewDelivery( delivRequest );

        // customer.last_purchase = newDelivery;
        // orderToProcess.deliv_id = newDelivery.id;
        // orderToProcess.trackingCode = newDelivery.tracking_code;

        customer.amount_spent = orderToProcess.total;
        customer.stripe_id = stripe_id;
        customer.credit = credit;
        
        Meteor.call( 'updateUser', orderToProcess.userId, customer );

        // orderToProcess.readyBy = delivery_window.starts_at;
        orderToProcess.deliv_day = delDay;
        // if (!Meteor.userId()) orderToProcess.customer = {
        //   first_name: customer.first_name,
        //   last_name: customer.last_name
        //   phone: customer.phone
        //   email: customer.email
        //   address_line_1: customer.address_line_1
        //   address_line_2customer.address_line_2 
        //   customer.address_city
        //   customer.address_state 
        //   customer.address_zipcode
        // }

        const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
          if(error) {
            console.log(error);
            throw new Meteor.Error(404, error);
            sAlert.error(error);
            Session.set('loading', false);
          } else {
            ga('ec:addProduct', {               // Provide product details in an productFieldObject.
              'name': orderToProcess.packName,                 // Product name (string).
              'price': orderToProcess.total,                 // Product price (currency).
              'coupon': orderToProcess.coupon,          // Product coupon (string).
              'quantity': 1                     // Product quantity (number).
            });
            ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
              'id': response._id,// (Required) Transaction id (string).
              'affiliation': 'Getfednyc.com', // Affiliation (string).
              'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
              'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
              'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
              'coupon': orderToProcess.coupon, // Transaction coupon (string).
            });
            ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
          };
        });

        Session.set('loading', false);
        sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});
      } catch(error) {
        console.log(error);
        Session.set('loading', false);
        throw new Meteor.Error(401, error);
      };
    };

    // Stripe.card.createToken({
    //   number: $('.number').val(),
    //   cvc: $('.cvc').val(),
    //   exp_month: $('.exp_month').val(),
    //   exp_year: $('.exp_year').val(),
    //   address_zip: customer.address_zipcode,
    // }, ( status, response ) => {
    //   if ( response.error ) {
    //     Session.set('loading', false );
    //     sAlert.error(response.error.message);
    //   } else {
    processSingleOrder();
    //   };
    // });
  },

  'submit #insertSubscriberOrderForm'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var orderToProcess = template.order.get();
    orderToProcess.userId = Meteor.userId();
    orderToProcess.total = template.order.total.get().toFixed(2);
    orderToProcess.packName = Session.get('pack').description;
    orderToProcess.coupon = template.order.coupon.get();
    var customer = {};
    customer.first_name = template.find('[name="customer.firstName"]').value;
    customer.last_name = template.find('[name="customer.lastName"]').value;
    customer.phone = template.find('[name="customer.phone"]').value;
    customer.email = template.find('[name="customer.email"]').value;
    customer.address_line_1 = template.find('[name="customer.address.line1"]').value;
    customer.address_line_2 = template.find('[name="customer.address.line2"]').value;
    customer.address_city = template.find('[name="customer.address.city"]').value;
    customer.address_state = template.find('[name="customer.address.state"]').value;
    customer.address_zipcode = template.find('[name="customer.address.zipCode"]').value;
    const comments = template.find('[name="destinationComments"]').value;
    var credit = template.userHasCredit.get();
    if (template.appliedCredit.get()) {
      credit = template.newCredit;
    } else {
      credit = template.userHasCredit.get();
    };
    var stripe_id = template.stripe_id;
    var source = template.find('[id="Source"]').value;

    const callWithPromise = (method, myParameters) => {
      return new Promise((resolve, reject) => {
        Meteor.call(method, myParameters, (err, res) => {
          if (err) reject('Something went wrong while ' + method);
          resolve(res);
        });
      });
    };

    async function processPromo() {
      try {
        const code = orderToProcess.coupon;
        var codeCheck = false;
        if (code) {
          usePromo.call({
            code: code
          }, (err, res) => {
            if (err) {
              return(err);
            } else {
              return(res);
            };
          });
        };
      } catch(error) {
        sAlert.error(error.reason);
      };
    };

    async function chargeStripe(charge) {
      try {
        const newCharge = await callWithPromise( 'processPayment', charge );
        return newCharge;
      } catch(error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      };
    };

    async function processOrder () {
      try {
        const codeCheck = await processPromo();
        console.log(codeCheck);
        // Make finalPrice in cents as a number from total
        const finalPrice = Math.round(Number(orderToProcess.total) * 100);

        charge  = {
          amount: finalPrice,
          currency: 'usd',
          customer: stripe_id,
          source: source,
          capture: false,
          description: orderToProcess.packName + " for " + customer.first_name + " " + customer.last_name,
          receipt_email: customer.email
        };

        if (finalPrice > 0) {
          // Charge Stripe
          const payment = await chargeStripe( charge );
          // Set users to TRIALING in Stripe FIX

          // Save the Stripe payment_id (FIX how we link the two)
          orderToProcess.stripe_id = payment.id;
          orderToProcess.salePrice = (finalPrice / 100).toFixed(2);
        } else {
          orderToProcess.salePrice = "0";
        };

        orderToProcess.paidAt = new Date();
        orderToProcess.status = "created";
             
        const packages = [{
          name: orderToProcess.packName,
          price: template.price,
          height: 12,
          width: 14,
          depth: 10,
        }];

        var delDay = $('[name="deliveryWindow"]').val();
        // var windows = Session.get('delivEstimate');
        // if ( delDay === "Monday") {
        //   var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
        // } else {
        //   var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
        // };

        // const delivRequest = {
        //   "order_reference": Session.get('orderId')._id,
        //   "customer": customer,
        //   "packages": packages,
        //   "delivery_window_id": delivery_window,
        //   "destination_comments": comments,
        // };

        // const newDelivery = await createNewDelivery( delivRequest );

        // customer.last_purchase = newDelivery;
        // orderToProcess.deliv_id = newDelivery.id;
        // orderToProcess.trackingCode = newDelivery.tracking_code;

        customer.amount_spent = orderToProcess.total;
        customer.stripe_id = stripe_id;
        customer.credit = credit;
        customer.customized = true;
        
        Meteor.call( 'updateUser', orderToProcess.userId, customer, (error,response) => {
          if (error) {
            throw new Meteor.Error(402, error);
            console.log(error);
          };
        });

        // orderToProcess.readyBy = delivery_window.starts_at;
        orderToProcess.deliv_day = delDay;

        const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
          if(error) {
            throw new Meteor.Error(404, error);
            sAlert.error(error);
            Session.set('loading', false);
          } else {
            ga('ec:addProduct', {               // Provide product details in an productFieldObject.
              'name': orderToProcess.packName,                 // Product name (string).
              'price': orderToProcess.total,                 // Product price (currency).
              'coupon': orderToProcess.coupon,          // Product coupon (string).
              'quantity': 1                     // Product quantity (number).
            });
            ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
              'id': response._id,// (Required) Transaction id (string).
              'affiliation': 'Getfednyc.com', // Affiliation (string).
              'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
              'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
              'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
              'coupon': orderToProcess.coupon, // Transaction coupon (string).
            });
            ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
          };
        });

        Session.set('loading', false);
        sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});       
      } catch(error) {
        Session.set('loading', false);
        throw new Meteor.Error(401, error);
      };
    };

    processOrder();
  },
});