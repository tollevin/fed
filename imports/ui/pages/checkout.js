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

// import {
//   updatePromo
// } from '../../api/promos/methods.js';

import './checkout-page.html';

// components
import '../components/loader.js';


Template.Checkout_page.onCreated(function checkoutPageOnCreated() {
  // Create a handle for subscription to this 'single.order', 'thisUserData'
  const handle = this.subscribe('single.order', Session.get('orderId')._id);
  const userData = this.subscribe('thisUserData', Meteor.userId());

  // Set initial Session variables
  Session.set('cartOpen', false);
  Session.set('loading', false);

  // Set default variables for template
  this.price = Session.get('order').price / 100;

  // Set reactive variables for template
  this.discount = new ReactiveVar(0);
  this.discountPercent = new ReactiveVar(0);
  this.discountValue = new ReactiveVar(false);
  this.userHasCredit = new ReactiveVar(false);
  this.zipField = new ReactiveVar(Session.get('delivEstimate').customer_zipcode);
  this.userHasPromo = new ReactiveVar(false);
  this.order = new ReactiveVar(Session.get('orderId'));
  this.order.coupon = new ReactiveVar( false );
  this.order.total = new ReactiveVar();  
  this.order.subtotal = new ReactiveVar();
  this.delivFee = new ReactiveVar(0);
  this.sources = new ReactiveVar(false);
  // for GUEST USERS and LOGGED IN USERS who haven't yet purchased, activate 2MEALSFREE initial deal
  if (Session.get('newUser')) {
    this.order.coupon.set("2MEALSFREE");
    var percentOff = ()=> {
      switch (this.price) {
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
    this.discountPercent.set( this.price * percentOff() / 100 );
    this.discountValue.set( "2 Meals FREE!" );
  };

  // All reactive data for autorun
  this.autorun(() => {

    const isReady = handle.ready();
    if (isReady) {

      // if USER is LOGGED IN
      if (userData.ready()) {
        if (Meteor.userId()) {

          if (Meteor.user().stripe_id) {
            // If the customer has a Stripe ID, we set it here
            const stripe_id = Meteor.user().stripe_id;
            this.stripe_id = stripe_id;
            // Call stripe user info
            Meteor.call( 'retrieveCustomer', stripe_id, (error, response) => {
              if (error) {
                console.log(error);
              } else {
                this.stripeCustomer = response;
                this.sources.set(this.stripeCustomer.sources);
                // console.log(this.stripeCustomer);
                // console.log(this.sources.get());
              };
            });
          };

          if (Meteor.user().subscriptions.status === "active" || "trialing") {
            var percentOff = Meteor.user().subscriptions.discount.coupon.id.split("b")[1];
            // if (percentOff[0] === "-") {
            //   template.discount.set( percentOff.split("-")[1] );
            //   template.discountValue.set( "- $" + discount.toFixed(2) );
            // }
            this.discountPercent.set( this.price * Number(percentOff) / 100 );
            this.discountValue.set( percentOff + "% \u2665" );
          };


          // Set if user has a credit on account
          if (Meteor.user().credit) {
            this.userHasCredit.set(Meteor.user().credit);
          };
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
  });
});

Template.Checkout_page.onRendered(function checkoutPageOnRendered() {
  // Set Stripe Public Key
  // Stripe.setPublishableKey('pk_test_ZWJ6mVy3TVMayrfp42HnHOMN');
  Stripe.setPublishableKey('pk_live_lL3dXkDsp3JgWtQ8RGlDxNrd');
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

  orders() {
    return Orders;
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
    return Session.get('order').description;
  },

  items() {
    var items = Session.get('order').dishes.concat(Session.get('order').snacks);
    return items;
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

  discount() {
    return Template.instance().discountValue.get();
  },

  userHasCredit() {
    if(Template.instance().userHasCredit.get() && (Template.instance().order.total > 0)) {
      return "$" + Template.instance().userHasCredit.get().toFixed(2);
    } else {
      return false;
    }
  },

  total() {
    return "$" + Template.instance().order.total.get().toFixed(2);
  },

  notSubscribed() {
    return true;
  },

  sources() {
    return Template.instance().sources.get();
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
            template.order.coupon.set( undefined );
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

    const user = Meteor.userId();
    const code = template.find('[id="promo"]').value.toUpperCase();
    template.subscribe('single.promo', code, {
      onReady: function () {
        Session.set('newUser', false);
        template.order.coupon.set( undefined );
        template.order.subtotal.set( template.price );
        template.order.total.set((template.order.subtotal.get() * 1.08875 ) + template.delivFee.get());
        template.discount.set( 0 );
        template.discountPercent.set( 0 );
        template.discountValue.set( false );

        const promo = Promos.findOne({code: code});
        const origPriceWTax = Math.round(template.price * 108.875) / 100;
        
        if (promo && !promo.active) {
          sAlert.error('Sorry, that code is no longer valid.');
          template.order.coupon.set( undefined );
        // } else if (promo.users && promo.users[user] === promo.useLimitPerCustomer) {
        //   sAlert.error("Sorry, you've used that code " + promo.users[user] + "/" + promo.useLimitPerCustomer + " times.");
        //   template.order.coupon.set( undefined );
        } else if (promo && promo.credit) {
          var discount = promo.credit;
          template.order.coupon.set( code );
          var newTotal = template.order.total.get() - discount;
          if (newTotal < 0) {
            const credit = 0 - newTotal;
            // FIX if (!Meteor.userId()) {
            template.userHasCredit.set(credit);
            template.discountValue.set("- $" + template.order.total.get().toFixed(2));
            template.discount.set( template.order.total.get() );
            sAlert.success('You now have a credit of $' + credit.toFixed(2) + ".");
          } else {
            template.discount.set( discount );
            template.discountValue.set( "- $" + discount.toFixed(2) );
          };
        } else if (promo && promo.percentage) {
          template.order.coupon.set( code );
          var percentOff = promo.percentage;
          template.discountPercent.set( template.price * percentOff / 100 );
          template.discountValue.set( "-" + percentOff + "%" );
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
    const origPriceWTax = template.price * 1.08875;
    var newTotal = origPriceWTax + template.delivFee.get() - credit;
    if (newTotal < 0) {
      const newCredit = 0 - newTotal;
      template.order.coupon.set( "ACCOUNT CREDIT" );
      template.userHasCredit.set(newCredit);
      template.discountValue.set("- $" + template.order.subtotal.get().toFixed(2));
      template.discount.set( template.order.subtotal.get() );
      sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
    } else {
      template.order.coupon.set( "ACCOUNT CREDIT OF" + credit );
      template.userHasCredit.set(0);
      template.discountValue.set("- $" + credit);
      template.discount.set( credit );
    };
  },

  'submit #insertOrderForm'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var orderToProcess = template.order.get();
    const user = Meteor.userId();
    const total = template.order.total.get().toFixed(2);
    const finalPrice = Math.round(Number(total) * 100);
    const packName = Session.get('order').description;
    const first_name = template.find('[name="customer.firstName"]').value;
    const last_name = template.find('[name="customer.lastName"]').value;
    const phone = template.find('[name="customer.phone"]').value;
    const email = template.find('[name="customer.email"]').value;
    const address_line_1 = template.find('[name="customer.address.line1"]').value;
    const address_line_2 = template.find('[name="customer.address.line2"]').value;
    const address_city = template.find('[name="customer.address.city"]').value;
    const address_state = template.find('[name="customer.address.state"]').value;
    const address_zipcode = template.find('[name="customer.address.zipCode"]').value;
    const comments = template.find('[name="destinationComments"]').value;
    const promo = template.order.coupon.get();
    const credit = template.userHasCredit.get();
    var stripe_id = template.stripe_id;

    Stripe.card.createToken({
      number: $('.number').val(),
      cvc: $('.cvc').val(),
      exp_month: $('.exp_month').val(),
      exp_year: $('.exp_year').val(),
      address_zip: address_zipcode,
    }, ( status, response ) => {
      if ( response.error ) {
        Session.set('loading', false );
        sAlert.error(response.error.message);
      } else {
        var token = response.id;

        if (stripe_id) {
          let charge;

          if (Meteor.user().subscriptions && Meteor.user().subscriptions.status != "canceled") {
            charge  = {
              amount: finalPrice,
              currency: 'usd',
              customer: stripe_id,
              capture: false,
              description: packName + " for " + first_name + " " + last_name,
              receipt_email: email
            };
          } else {
            charge  = {
              amount: finalPrice,
              currency: 'usd',
              // customer: stripe_id,
              source: token,
              description: packName + " for " + first_name + " " + last_name,
              receipt_email: email
            };
          }

          if (finalPrice > 0) {
            Meteor.call( 'processPayment', charge, ( error, response ) => {
              if ( error ) {
                Session.set('loading', false );
                sAlert.error( error.reason );
                console.log(error);
              } else {
                orderToProcess.stripe_id = response.id;
                orderToProcess.paidAt = new Date();
                orderToProcess.salePrice = (finalPrice / 100).toFixed(2);
                orderToProcess.status = "created";

                const delivCustomer = {
                  first_name: first_name,
                  last_name: last_name,
                  email: email,
                  phone: phone,
                  address_line_1: address_line_1,
                  address_line_2: address_line_2,
                  address_city: address_city,
                  address_state: address_state,
                  address_zipcode: address_zipcode,
                };

                const packages = [{
                  name: packName,
                  price: template.price,
                  height: 12,
                  width: 14,
                  depth: 10,
                }];

                var delDay = $('[name="deliveryWindow"]').val();
                var windows = Session.get('delivEstimate');
                if ( delDay === "Monday") {
                  var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
                } else {
                  var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
                };

                const delivRequest = {
                  "order_reference": Session.get('orderId')._id,
                  "customer": delivCustomer,
                  "packages": packages,
                  "delivery_window_id": delivery_window,
                  "destination_comments": comments,
                };

                Meteor.call( 'createDelivery', delivRequest, ( error, response ) => {
                  if ( error ) {
                    Session.set('loading', false );
                    sAlert.error(error.reason);
                  } else {
                    const last_purchase = response;
                    const amount_spent = total;
                    const customer = {
                      first_name,
                      last_name,
                      email,
                      phone,
                      address_line_1,
                      address_line_2,
                      address_city,
                      address_state,
                      address_zipcode,
                      amount_spent,
                      credit,
                      last_purchase,
                      stripe_id
                    };

                    Meteor.call( 'updateUser', user, customer, ( error, response ) => {
                      if ( error ) {
                        console.log(error + "; error");
                      };
                    });

                    orderToProcess.readyBy = delivery_window.starts_at;
                    orderToProcess.deliv_day = delDay;
                    orderToProcess.deliv_id = last_purchase.id;
                    orderToProcess.trackingCode = last_purchase.tracking_code;
                    orderToProcess.coupon = promo;

                    const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
                      if ( error ) {
                        console.log(error);
                      } else {
                        ga('ec:addProduct', {               // Provide product details in an productFieldObject.
                          'name': packName,                 // Product name (string).
                          'price': total,                 // Product price (currency).
                          'coupon': promo,          // Product coupon (string).
                          'quantity': 1                     // Product quantity (number).
                        });
                        ga('ec:setAction', 'purchase', {          // Transaction details are provided in an actionFieldObject.
                          'id': last_purchase.tracking_code,                         // (Required) Transaction id (string).
                          'affiliation': 'Getfednyc.com', // Affiliation (string).
                          'revenue': parseFloat(template.order.subtotal.get().toFixed(2)),                     // Revenue (currency).
                          'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)),                          // Tax (currency).
                          'shipping': parseFloat(template.delivFee.get().toFixed(2)),                     // Shipping (currency).
                          'coupon': template.order.coupon.get(),                  // Transaction coupon (string).
                        });
                        ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
                        // analytics.track('Order Completed', {
                        //   checkout_id: last_purchase.tracking_code,
                        //   order_id: response.id,
                        //   affiliation: 'Getfednyc.com',
                        //   total: total,
                        //   revenue: parseFloat(template.order.subtotal.get().toFixed(2)),
                        //   shipping: parseFloat(template.delivFee.get().toFixed(2)),
                        //   tax: parseFloat((template.order.subtotal.get() * .08875).toFixed(2)),
                        //   discount: template.discount.get(),
                        //   coupon: template.order.coupon.get(),
                        //   currency: 'USD',
                        //   products: [
                        //     {
                        //       name: orderToProcess.description,
                        //       price: parseFloat(template.price.toFixed(2)),
                        //       quantity: 1,
                        //     },
                        //   ]
                        // });
                      };
                    });
                  };
                });
                Session.set('loading', false);
                sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});
              };
            });
          } else {
            orderToProcess.paidAt = new Date();
            orderToProcess.salePrice = "0";
            orderToProcess.status = "created";
         
            const delivCustomer = {
              first_name: first_name,
              last_name: last_name,
              email: email,
              phone: phone,
              address_line_1: address_line_1,
              address_line_2: address_line_2,
              address_city: address_city,
              address_state: address_state,
              address_zipcode: address_zipcode,
            };
            
            const packages = [{
              name: packName,
              price: template.price,
              height: 12,
              width: 14,
              depth: 10,
            }];

            var delDay = $('[name="deliveryWindow"]').val();

            if ( delDay === "Monday") {
              var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
            } else {
              var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
            };

            const delivRequest = {
              "order_reference": Session.get('orderId')._id,
              "customer": delivCustomer,
              "packages": packages,
              "delivery_window_id": delivery_window,
              "destination_comments": comments,
            };

            Meteor.call( 'createDelivery', delivRequest, ( error, response ) => {
              if ( error ) {
                Session.set('loading', false );
                sAlert.error( error.reason );
              } else {
                const last_purchase = response;
                const amount_spent = total;
                const customer = {
                  first_name,
                  last_name,
                  email,
                  phone,
                  address_line_1,
                  address_line_2,
                  address_city,
                  address_state,
                  address_zipcode,
                  amount_spent,
                  credit,
                  last_purchase,
                  stripe_id                  
                };

                Meteor.call( 'updateUser', user, customer, ( error, response ) => {
                  if ( error ) {
                    console.log(error + "; error");
                  };
                });

                orderToProcess.readyBy = delivery_window.starts_at;
                orderToProcess.deliv_day = delDay;
                orderToProcess.deliv_id = last_purchase.id;
                orderToProcess.trackingCode = last_purchase.tracking_code;
                const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
                  if ( error ) {
                    console.log(error);
                  } else {
                    ga('ec:addProduct', {               // Provide product details in an productFieldObject.
                      'name': packName,                 // Product name (string).
                      'price': total,                 // Product price (currency).
                      'coupon': promo,          // Product coupon (string).
                      'quantity': 1                     // Product quantity (number).
                    });
                    ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
                      'id': last_purchase.tracking_code,// (Required) Transaction id (string).
                      'affiliation': 'Getfednyc.com', // Affiliation (string).
                      'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
                      'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
                      'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
                      'coupon': template.order.coupon.get(), // Transaction coupon (string).
                    });
                    ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
                    // analytics.track('Completed Order', {
                    //   checkout_id: last_purchase.tracking_code,
                    //   order_id: response.id,
                    //   affiliation: 'Getfednyc.com',
                    //   total: total,
                    //   revenue: parseFloat(template.order.subtotal.get().toFixed(2)),
                    //   shipping: parseFloat(template.delivFee.get().toFixed(2)),
                    //   tax: parseFloat((template.order.subtotal.get() * .08875).toFixed(2)),
                    //   discount: template.discount.get(),
                    //   coupon: template.order.coupon.get(),
                    //   currency: 'USD',
                    //   products: [
                    //     {
                    //       name: orderToProcess.description,
                    //       price: parseFloat(template.price.toFixed(2)),
                    //       quantity: 1,
                    //     },
                    //   ]
                    // });
                  };
                });
              };
            });

            Session.set('loading', false);
            sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});
          };
        } else {
          const cust = {
            description: "Customer for " + email,
            source: token,
            account_balance: 0
          };

          Meteor.call( 'createCustomer', cust, ( error, response ) => {
            if (error) {
              console.log(error);
            } else {
              stripe_id = response.id;
              let charge  = {
                amount: finalPrice,
                currency: 'usd',
                customer: stripe_id,
                description: orderToProcess.packName,
                receipt_email: email
              };

              if (finalPrice > 0) {
                Meteor.call( 'processPayment', charge, ( error, response ) => {
                  if ( error ) {
                    Session.set('loading', false );
                    sAlert.error( error.reason );
                    console.log(error);
                  } else {
                    orderToProcess.stripe_id = response.id;
                    orderToProcess.paidAt = new Date();
                    orderToProcess.salePrice = (finalPrice / 100).toFixed(2);
                    orderToProcess.status = "created";

                    const delivCustomer = {
                      first_name: first_name,
                      last_name: last_name,
                      email: email,
                      phone: phone,
                      address_line_1: address_line_1,
                      address_line_2: address_line_2,
                      address_city: address_city,
                      address_state: address_state,
                      address_zipcode: address_zipcode,
                    };

                    const packages = [{
                      name: packName,
                      price: template.price,
                      height: 12,
                      width: 14,
                      depth: 10,
                    }];

                    var delDay = $('[name="deliveryWindow"]').val();
                    var windows = Session.get('delivEstimate');
                    if ( delDay === "Monday") {
                      var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
                    } else {
                      var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
                    };

                    const delivRequest = {
                      "order_reference": Session.get('orderId')._id,
                      "customer": delivCustomer,
                      "packages": packages,
                      "delivery_window_id": delivery_window,
                      "destination_comments": comments,
                    };

                    Meteor.call( 'createDelivery', delivRequest, ( error, response ) => {
                      if ( error ) {
                        Session.set('loading', false );
                        sAlert.error(error.reason);
                      } else {
                        const last_purchase = response;
                        const amount_spent = total;
                        const customer = {
                          first_name,
                          last_name,
                          email,
                          phone,
                          address_line_1,
                          address_line_2,
                          address_city,
                          address_state,
                          address_zipcode,
                          amount_spent,
                          credit,
                          last_purchase,
                          stripe_id
                        };

                        Meteor.call( 'updateUser', user, customer, ( error, response ) => {
                          if ( error ) {
                            console.log(error + "; error");
                          };
                        });

                        orderToProcess.readyBy = delivery_window.starts_at;
                        orderToProcess.deliv_day = delDay;
                        orderToProcess.deliv_id = last_purchase.id;
                        orderToProcess.trackingCode = last_purchase.tracking_code;
                        orderToProcess.coupon = promo;

                        const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
                          if ( error ) {
                            console.log(error);
                          } else {
                            ga('ec:addProduct', {               // Provide product details in an productFieldObject.
                              'name': packName,                 // Product name (string).
                              'price': total,                 // Product price (currency).
                              'coupon': promo,          // Product coupon (string).
                              'quantity': 1                     // Product quantity (number).
                            });
                            ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
                              'id': last_purchase.tracking_code,// (Required) Transaction id (string).
                              'affiliation': 'Getfednyc.com', // Affiliation (string).
                              'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
                              'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
                              'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
                              'coupon': template.order.coupon.get(), // Transaction coupon (string).
                            });
                            ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
                            // analytics.track('Order Completed', {
                            //   checkout_id: last_purchase.tracking_code,
                            //   order_id: response.id,
                            //   affiliation: 'Getfednyc.com',
                            //   total: total,
                            //   revenue: parseFloat(template.order.subtotal.get().toFixed(2)),
                            //   shipping: parseFloat(template.delivFee.get().toFixed(2)),
                            //   tax: parseFloat((template.order.subtotal.get() * .08875).toFixed(2)),
                            //   discount: template.discount.get(),
                            //   coupon: template.order.coupon.get(),
                            //   currency: 'USD',
                            //   products: [
                            //     {
                            //       name: orderToProcess.description,
                            //       price: parseFloat(template.price.toFixed(2)),
                            //       quantity: 1,
                            //     },
                            //   ]
                            // });
                          };
                        });
                      };
                    });
                    Session.set('loading', false);
                    sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});
                  };
                });
              } else {
                orderToProcess.paidAt = new Date();
                orderToProcess.salePrice = "0";
                orderToProcess.status = "created";
             
                const delivCustomer = {
                  first_name: first_name,
                  last_name: last_name,
                  email: email,
                  phone: phone,
                  address_line_1: address_line_1,
                  address_line_2: address_line_2,
                  address_city: address_city,
                  address_state: address_state,
                  address_zipcode: address_zipcode,
                };
                
                const packages = [{
                  name: packName,
                  price: template.price,
                  height: 12,
                  width: 14,
                  depth: 10,
                }];

                var delDay = $('[name="deliveryWindow"]').val();

                if ( delDay === "Monday") {
                  var delivery_window = Session.get('delivEstimate').delivery_windows[3].id;
                } else {
                  var delivery_window = Session.get('delivEstimate').delivery_windows[0].id;
                };

                const delivRequest = {
                  "order_reference": Session.get('orderId')._id,
                  "customer": delivCustomer,
                  "packages": packages,
                  "delivery_window_id": delivery_window,
                  "destination_comments": comments,
                };

                Meteor.call( 'createDelivery', delivRequest, ( error, response ) => {
                  if ( error ) {
                    Session.set('loading', false );
                    sAlert.error( error.reason );
                  } else {
                    const last_purchase = response;
                    const amount_spent = total;
                    const customer = {
                      first_name,
                      last_name,
                      email,
                      phone,
                      address_line_1,
                      address_line_2,
                      address_city,
                      address_state,
                      address_zipcode,
                      amount_spent,
                      credit,
                      last_purchase,
                      stripe_id                  
                    };

                    Meteor.call( 'updateUser', user, customer, ( error, response ) => {
                      if ( error ) {
                        console.log(error + "; error");
                      };
                    });

                    orderToProcess.readyBy = delivery_window.starts_at;
                    orderToProcess.deliv_day = delDay;
                    orderToProcess.deliv_id = last_purchase.id;
                    orderToProcess.trackingCode = last_purchase.tracking_code;
                    console.log(orderToProcess);
                    const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
                      if ( error ) {
                        console.log(error);
                      } else {
                        ga('ec:addProduct', {               // Provide product details in an productFieldObject.
                          'name': packName,                 // Product name (string).
                          'price': total,                 // Product price (currency).
                          'coupon': promo,          // Product coupon (string).
                          'quantity': 1                     // Product quantity (number).
                        });
                        ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
                          'id': last_purchase.tracking_code,// (Required) Transaction id (string).
                          'affiliation': 'Getfednyc.com', // Affiliation (string).
                          'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
                          'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
                          'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
                          'coupon': template.order.coupon.get(), // Transaction coupon (string).
                        });
                        ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
                        // analytics.track('Order Completed', {
                        //   checkout_id: last_purchase.tracking_code,
                        //   order_id: response.id,
                        //   affiliation: 'Getfednyc.com',
                        //   total: total,
                        //   revenue: parseFloat(template.order.subtotal.get().toFixed(2)),
                        //   shipping: parseFloat(template.delivFee.get().toFixed(2)),
                        //   tax: parseFloat((template.order.subtotal.get() * .08875).toFixed(2)),
                        //   discount: template.discount.get(),
                        //   coupon: template.order.coupon.get(),
                        //   currency: 'USD',
                        //   products: [
                        //     {
                        //       name: orderToProcess.description,
                        //       price: parseFloat(template.price.toFixed(2)),
                        //       quantity: 1,
                        //     },
                        //   ]
                        // });
                      };
                    });
                  };
                });

                Session.set('loading', false);
                sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});
              };
            };
          });
        };
      };
    });
  },

  // 'click #SaveOrder'(event, template) {
  //   event.preventDefault();
  //   Session.set('loading', true);

  //   var orderToProcess = template.order.get();
  //   const user = Meteor.userId();
  //   const total = template.order.total.get().toFixed(2);
  //   const finalPrice = Math.round(Number(total) * 100);
  //   const packName = Session.get('order').description;
  //   const first_name = template.find('[name="customer.firstName"]').value;
  //   const last_name = template.find('[name="customer.lastName"]').value;
  //   const phone = template.find('[name="customer.phone"]').value;
  //   const email = template.find('[name="customer.email"]').value;
  //   const address_line_1 = template.find('[name="customer.address.line1"]').value;
  //   const address_line_2 = template.find('[name="customer.address.line2"]').value;
  //   const address_city = template.find('[name="customer.address.city"]').value;
  //   const address_state = template.find('[name="customer.address.state"]').value;
  //   const address_zipcode = template.find('[name="customer.address.zipCode"]').value;
  //   const comments = template.find('[name="destinationComments"]').value;
  //   const promo = template.order.coupon.get();
  //   const credit = template.userHasCredit.get();
  //   var stripe_id = template.stripe_id;
  // }
});