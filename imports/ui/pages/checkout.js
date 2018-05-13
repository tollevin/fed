import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import moment from 'moment';
// import { HTTP } from 'meteor/http';

// Collections
import { Items } from '../../api/items/items.js';
import { Orders } from '../../api/orders/orders.js';
import { Promos } from '../../api/promos/promos.js';
import { DeliveryWindows } from '../../api/delivery/delivery-windows.js';

// Zip Codes
import { 
  zipZones
} from '../../api/delivery/zipcodes.js';

// Methods
import { processOrder } from '../../api/orders/methods.js';
import { usePromo } from '../../api/promos/methods.js';
import { subscribeToPlan } from '../../api/plans/methods.js';

// Template
import './checkout-page.html';

// Components
import '../components/loader.js';
import '../components/stripe-card-element.js';

Template.Checkout_page.onCreated(function checkoutPageOnCreated() {
  // Create a handle for subscription to this 'single.order', 'thisUserData'
  if (Session.get('orderId')) {
    const handle = this.subscribe('single.order', Session.get('orderId')._id);
    const thisUserData = this.subscribe('thisUserData', Meteor.userId());
    this.subscribe('DeliveryWindows.forMenu', Session.get('menu')._id);
    
    const order = Session.get('Order');
    // const discount = {
    //   subscriber_discount: {},
    // };

    // Set initial Session variables
    // Session.set('processing', false);
    Session.set('loading', false);

    // Set reactive variables for template
    this.userHasCredit = new ReactiveVar(0);  // Unused credit on user account
    this.zipField = new ReactiveVar(Meteor.user().address_zipcode);  // zip field value
    this.userHasPromo = new ReactiveVar(false);  // toggle promo input
    this.order = new ReactiveVar(order); // base order
    this.order.coupon = new ReactiveVar( false ); // discount.promo.code
    this.order.total = new ReactiveVar(Session.get('orderId').total);  // order.total
    this.order.subtotal = new ReactiveVar(Session.get('orderId').subtotal);  // order.subtotal
    this.delivFee = new ReactiveVar(0);  // order.delivery_fee
    this.sources = new ReactiveVar(false); // stored card IDs

    // Discount Vars
    this.discount = new ReactiveVar(Session.get('orderId').discount);  // discount Object
    this.appliedCredit = new ReactiveVar(0);  // discount.credit
    this.subscriber_discount = new ReactiveVar(Session.get('orderId').discount.subscriber_discount);  // discount.subscriber_discount
    this.promo = new ReactiveVar(null);  // discount.promo
    this.discountValue = new ReactiveVar(Session.get('orderId').discount.value); // discount.value    

    // All reactive data for autorun
    this.autorun(() => {

      const isReady = handle.ready();
      if (isReady && thisUserData.ready()) {
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

          // // Set Subscription Discounts
          // if (Meteor.user().subscriptions && Meteor.user().subscriptions.length > 0) {  // FIX to fix old user.subscriptions
          //   const subs = Meteor.user().subscriptions;

          //   var discount = {
          //     subscriber_discount: {},
          //     value : 0
          //   };

          //   // for each subscription
          //   for (var i = subs.length - 1; i >= 0; i--) {
          //     const subItemId = subs[i].item_id;
            
          //     // find the subscription item in the items list
          //     const orderItems = order.items;
          //     var subItem = orderItems.find((element)=> {
          //       return element._id === subItemId;
          //     });
          //     // add discount property to item
          //     // subItem.discount.subscriber_discount = subs[i].discount;
          //     // add discount object to order.discount
          //     discount.subscriber_discount[subItemId] = subs[i].discount;
          //     discount.value += (subs[i].discount / 100 * subItem.price_per_unit);
          //   };

          //   // Update template vars
          //   this.discount.set(discount);
          //   this.discountValue.set(discount.value);
          //   //   this.subscriber_discount.set(subscriber_discount);
          // };

          // // Set Pending Subscription Discounts
          // if (order.subscriptions && order.subscriptions.length > 0) {
          //   const subs = order.subscriptions;

          //   var discount = this.discount.get();

          //   if (!discount) {
          //     discount = {
          //       subscriber_discount: {},
          //       value : 0,
          //     };
          //   };

          //   // for each subscription
          //   for (var i = subs.length - 1; i >= 0; i--) {
          //     const subItemId = subs[i].item_id;
            
          //     // find the subscription item in the items list
          //     const orderItems = order.items;
          //     var subItem = orderItems.find((element)=> {
          //       return element._id === subItemId;
          //     });
          //     // add discount property to item
          //     // subItem.discount.subscriber_discount = subs[i].discount;
          //     // add discount object to order.discount
          //     discount.subscriber_discount[subItemId] = subs[i].discount;
          //     discount.value += (subs[i].discount / 100 * subItem.price_per_unit)
          //   };

          //   // Update Session Order var
          //   this.discount.set(discount);
          //   this.discountValue.set(discount.value);
          //   // console.log(this.discount.get());
          // };

          // Set if user has a credit on account
          if (Meteor.user().credit > 0) {
            const credit = Meteor.user().credit;
            Math.round(credit * 100) / 100;
            this.userHasCredit.set(credit);
          };
        } else {
          FlowRouter.go('/');
        };
      };

      // Reactive vars to be autorun
      if (!this.zipField.get()) this.zipField.set(Meteor.user().profile.zipCode);
      const zip = this.zipField.get();
      const deliveryFees = zipZones[zip].delivery_fees; // FIX BIX
      
      if (deliveryFees) {
        if (this.order.subtotal.get() > 150) {
          this.delivFee.set(deliveryFees.tier3);
        } else {
          this.delivFee.set(deliveryFees.tier1);
        };
      };

      this.order.total.set( (this.order.subtotal.get() * 1.08875) + this.delivFee.get() - this.discountValue.get());
    });
  } else {
    sAlert.error("Sorry, your order got tossed! Redirecting you home...", { timeout: 3000, onClose: function() { FlowRouter.go('/'); }});
  };
});

Template.Checkout_page.onRendered(function checkoutPageOnRendered() {
  
});

Template.Checkout_page.onDestroyed(function checkoutPageOnDestroyed() {
  
});

Template.Checkout_page.helpers({
  packItems() {
    var itemList = Session.get('Order').items;
    var itemTally = {};

    for (var i = itemList.length - 1; i >= 0; i--) {
      if (!itemTally[itemList[i].name]) {
        itemTally[itemList[i].name] = 1;
      } else {
        itemTally[itemList[i].name] += 1;
      };
    };
    
    var result = [];
    for (var key in itemTally) result.push({name:key,value:itemTally[key]});
    return result;
  },

  isPlan(item) {
    var subscriptions = Session.get('orderId').subscriptions;
    if (subscriptions) {
      for (var i = subscriptions.length - 1; i >= 0; i--) {
        var subItemName = subscriptions[i].item_name;
        if (subItemName === item.name) return true;
      };
    };
  },

  price() {
    return "$" + Template.instance().order.subtotal.get().toFixed(2);
  },

  tax() {
    return "$" + (Template.instance().order.subtotal.get() * .08875).toFixed(2);
  },

  deliveryFee() {
    return "$" + Template.instance().delivFee.get().toFixed(2);
  },

  userHasCredit() {
    if(Template.instance().userHasCredit.get() && !(Template.instance().appliedCredit.get())) {
      return "$" + Template.instance().userHasCredit.get().toFixed(2);
    } else {
      return false;
    }
  },

  discount() {
    return "- $" + Template.instance().discountValue.get();
  },

  total() {
    return "$" + Template.instance().order.total.get().toFixed(2);
  },

  havePromo() {
    return Template.instance().userHasPromo.get();
  },

  stripeID() {
    return Meteor.user().stripe_id;
  },

  formType() {
    // if (Meteor.userId() && Meteor.user().subscriptions && (Meteor.user().subscriptions.status != 'canceled')) {
    //   return "insertSubscriberOrderForm";
    // } else {
      return "insertOrderForm";
    // };
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

  deliveryWindows() {
    return DeliveryWindows.find({},{sort: { delivery_start_time: 1 }});
  },

  toDateStr(date) {
    const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
    const dateToString = moment(date).format("dddd, MMMM Do, h") + '-' + endDate.format("ha");
    return dateToString;
  },

  isSunOrMon() {
    return moment().day() === 0 || 1;
  },

  email() {
    return Meteor.userId() && Meteor.user().emails[0].address;
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

  // 'change #EsBbF9Ads8fEFFAut'(event, template) {
  //   event.preventDefault();

  //   if (!Meteor.user()) {
  //     const email = event.target.value;
      
  //     Meteor.call('checkUserHasPurchased', email, ( error, response ) => {
  //       if ( error ) {
  //         console.log(error);
  //       } else {
  //         if (response) {
  //           template.order.coupon.set( false );
  //           template.discount.set(0);
  //           template.discountValue.set( false );
  //           sAlert.error("Your email address already exists in our system.");
  //         };
  //       }; 
  //     });
  //   };
  // },

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
          // template.order.coupon.set( code );

          var newTotal = total - discount;
          if (newTotal < 0) {
            var newCredit = 0 - newTotal;
            // FIX if (!Meteor.userId()) {
            template.newCredit = Math.round(newCredit * 100) / 100;
            template.discountValue.set( total );
            // template.appliedCredit.set( total );
            // FIX Notifications!
            sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
          } else {
            template.discountValue.set( discount );
            // template.appliedCredit.set( discount );
            template.newCredit = 0;
          };

          const discountPromo = {
            type: 'credit',
            code: code,
            description: promo.desc,
            value: template.appliedCredit.get(),
          };
          template.promo.set(discountPromo);
        } else if (promo && promo.percentage) {
          // notify only on subs?

          // template.order.coupon.set( code );
          // if (code === "FED40") {
          //   sAlert.error("Sorry, that code only applies toward subscriptions");
          //   template.order.coupon.set( false );
          // } else {
          //   var percentOff = promo.percentage;
          //   template.discountPercent.set( template.price * percentOff / 100 );
          //   template.discountValue.set( "-" + percentOff + "%" );
          //   const discountPromo = {
          //     type: 'percent',
          //     code: code,
          //     description: promo.desc,
          //     value: percentOff,
          //   };
          //   template.discountPromo.set(discountPromo);
          // };


          
        // } else if (promo && promo.function) {
        //   template.order.coupon.set( code );
        //   if (code === "MORE4LESS") {
        //     var percentOff = ()=> {
        //       switch (template.price) {
        //         case 85:
        //           return 34;
        //           break;
        //         case 110:
        //           return 26;
        //           break;
        //         case 135:
        //           return 20;
        //           break;
        //         case 159:
        //           return 18;
        //           break;
        //       };
        //     };
        //     template.discount.set( template.price * percentOff() / 100 );
        //     template.discountValue.set( "2 Meals FREE!" );
        //   } else if (code === "GETMOREFED") {
        //     template.order.coupon.set( code );
        //     template.order.packDishes.push("+ 2 Chef's Plate");
        //     template.discountValue.set( "$0" );
        //     sAlert.success("Great! 2 Chef's Plates have been added to your pack!");
        //   };
        } else {
          sAlert.error("Sorry, that code isn't recognized");
          // template.discount.set( 0 );
          // template.discountValue.set( false );

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
    const discount = template.discountValue.get();
    const total = template.order.total.get();
    var newDiscount = discount + credit;
    if (total < newDiscount) {
      const newCredit = newDiscount - total;
      // template.order.coupon.set( "ACCOUNT CREDIT of" + total );
      template.discountValue.set( total );
      template.appliedCredit.set( credit - newCredit );
      // template.discount.set( template.order.total.get() );
      sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
      template.newCredit = new ReactiveVar( newCredit );
    } else {
      // template.order.coupon.set( "ACCOUNT CREDIT OF" + credit );
      template.appliedCredit.set( credit );
      template.discountValue.set( discount + credit );
      template.newCredit = new ReactiveVar( 0 );
      // template.discountValue.set("- $" + credit);
      // template.discount.set( credit );
      sAlert.success('$' + credit.toFixed(2) + " worth of FedCred has been applied!");
    };
  },

  'blur #address-zip'(event, template) {
    const value = event.currentTarget.value;
    if (!zipZones[value]) {
      const errorElement = document.getElementById('zip-errors');
      errorElement.textContent = 'Sorry, but we only deliver to Brooklyn, Queens, and Manhattan at this time.';
    };
  },

  'submit #insertOrderForm'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    var orderToProcess = template.order.get();
    
    orderToProcess.total = template.order.total.get().toFixed(2);
    // orderToProcess.packName = Session.get('pack').description;
    orderToProcess.coupon = template.order.coupon.get();
    
    var customer = {
      first_name: template.find('[name="customer.firstName"]').value,
      last_name: template.find('[name="customer.lastName"]').value,
      phone: template.find('[name="customer.phone"]').value,
      email: template.find('[name="customer.email"]').value,
      address_line_1: template.find('[name="customer.address.line1"]').value,
      address_line_2: template.find('[name="customer.address.line2"]').value,
      address_city: template.find('[name="customer.address.city"]').value,
      address_state: template.find('[name="customer.address.state"]').value,
      address_zipcode: template.find('[name="customer.address.zipCode"]').value,
    };
    orderToProcess.recipient = customer;
    orderToProcess.delivery_comments = template.find('[name="destinationComments"]').value;

    let credit;
    if (template.appliedCredit.get()) {
      credit = template.newCredit.get();
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
        // console.log(card, stripe, token);
        return token;
      } catch(error) {
        // Inform the customer that there was an error
        console.log(error);
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
            description: "Order for " + customer.first_name + " " + customer.last_name,
            receipt_email: customer.email
          };
        // Else if new customer
        } else {
          const token = await createStripeTokenFromElement();
          // console.log(token);
          const cust = {
            description: "Customer for " + customer.first_name + " " + customer.last_name,
            source: token.id,
            account_balance: 0,
            email: customer.email
          };

          const newStripeCustomer = await createStripeCustomer( cust );
          // console.log(newStripeCustomer);
          stripe_id = newStripeCustomer.id;
          charge  = {
            amount: finalPrice,
            currency: 'usd',
            customer: stripe_id,
            description: "Order for " + customer.first_name + " " + customer.last_name,
            receipt_email: customer.email
          };
        };

        // If final price is positive, charge stripe
        if (finalPrice > 0) {
          // Charge Stripe
          const payment = await chargeStripe( charge );
          // console.log(payment);
          orderToProcess.payment_id = payment.id;
          orderToProcess.total = Number((finalPrice / 100).toFixed(2));
        } else {
          orderToProcess.total = 0;
        };

        orderToProcess.paid_at = new Date();

        const delDay = $('[name="deliveryWindow"]').val();
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
        customer.credit = Math.round(credit * 100) / 100;
        var user = Meteor.user();
        
        Meteor.call( 'updateUser', user._id, customer );

        // orderToProcess.readyBy = delivery_window.starts_at;
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

        const order = Session.get('orderId');
        order.recipient = customer;
        order.gift = null;
        order.discount = {
          subscriber_discount: template.subscriber_discount.get(),
          promo: template.promo.get(),
          credit: template.appliedCredit.get(),
          value: template.discountValue.get(),
        };
        order.delivery_fee = template.delivFee.get();
        order.subtotal = template.order.subtotal.get();
        order.total = Math.round(template.order.total.get() * 100) / 100;
        order.payment_id = orderToProcess.payment_id;
        order.paid_at = orderToProcess.paid_at;
        order.ready_by = Session.get('menu').ready_by;
        order.delivery_window_id = delDay;
        order.delivery_comments = orderToProcess.delivery_comments;

        const processedOrder = processOrder.call(order, ( error, response ) => {
          if(error) {
            console.log(error);
            throw new Meteor.Error(404, error);
            sAlert.error(error);
            Session.set('loading', false);
          } else {
            Session.set('Order', null);
            Session.set('orderId', response)
            // ga('ec:addProduct', {               // Provide product details in an productFieldObject.
            //   'name': orderToProcess.packName,                 // Product name (string).
            //   'price': orderToProcess.total,                 // Product price (currency).
            //   'coupon': orderToProcess.coupon,          // Product coupon (string).
            //   'quantity': 1                     // Product quantity (number).
            // });
            // ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
            //   'id': response._id,// (Required) Transaction id (string).
            //   'affiliation': 'Getfednyc.com', // Affiliation (string).
            //   'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
            //   'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
            //   'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
            //   'coupon': orderToProcess.coupon, // Transaction coupon (string).
            // });
            // ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
            Meteor.call( 'sendOrderConfirmationEmail', Meteor.userId(), order, ( error, response ) => {
              if ( error ) {
                console.log(error);
              };
            }); 
          };
        });

        Session.set('loading', false);
        FlowRouter.go('Confirmation');
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

  // 'submit #insertSubscriberOrderForm'(event, template) {
  //   event.preventDefault();
  //   Session.set('loading', true);

  //   var orderToProcess = template.order.get();
  //   orderToProcess.user_id = Meteor.userId();
  //   orderToProcess.total = template.order.total.get().toFixed(2);
  //   orderToProcess.packName = Session.get('pack').description;
  //   orderToProcess.coupon = template.order.coupon.get();
  //   var customer = {
  //     first_name: template.find('[name="customer.firstName"]').value,
  //     last_name: template.find('[name="customer.lastName"]').value,
  //     phone: template.find('[name="customer.phone"]').value,
  //     email: template.find('[name="customer.email"]').value,
  //     address_line_1: template.find('[name="customer.address.line1"]').value,
  //     address_line_2: template.find('[name="customer.address.line2"]').value,
  //     address_city: template.find('[name="customer.address.city"]').value,
  //     address_state: template.find('[name="customer.address.state"]').value,
  //     address_zipcode: template.find('[name="customer.address.zipCode"]').value,
  //   };
  //   const recipient = customer;
  //   const comments = template.find('[name="destinationComments"]').value;
  //   var credit = template.userHasCredit.get();
  //   if (template.appliedCredit.get()) {
  //     credit = template.newCredit;
  //   } else {
  //     credit = template.userHasCredit.get();
  //   };
  //   var stripe_id = template.stripe_id;
  //   var source = template.find('[id="Source"]').value;

  //   const callWithPromise = (method, myParameters) => {
  //     return new Promise((resolve, reject) => {
  //       Meteor.call(method, myParameters, (err, res) => {
  //         if (err) reject('Something went wrong while ' + method);
  //         resolve(res);
  //       });
  //     });
  //   };

  //   async function processPromo() {
  //     try {
  //       const code = orderToProcess.coupon;
  //       var codeCheck = false;
  //       if (code) {
  //         usePromo.call({
  //           code: code
  //         }, (err, res) => {
  //           if (err) {
  //             return(err);
  //           } else {
  //             return(res);
  //           };
  //         });
  //       };
  //     } catch(error) {
  //       sAlert.error(error.reason);
  //     };
  //   };

  //   async function chargeStripe(charge) {
  //     try {
  //       const newCharge = await callWithPromise( 'processPayment', charge );
  //       return newCharge;
  //     } catch(error) {
  //       // Inform the customer that there was an error
  //       const errorElement = document.getElementById('payment-errors');
  //       errorElement.textContent = error.message;
  //       Session.set('loading', false);
  //     };
  //   };

  //   async function updateSubscriber() {
  //     try {
  //       const subscriptionId = Meteor.user().subscriptions.id;

  //       var nextThursdayTime = moment().day(11).hours(0).minutes(0).seconds(0).unix();
        
  //       const args = {
  //         subscription_id: subscriptionId,
  //         trial_end: nextThursdayTime,
  //         prorate: false,
  //       };

  //       const updatedSub = await callWithPromise( 'updateSubscription', args );
  //     } catch(error) {
  //       throw new Meteor.Error(407, error);
  //     };
  //   }

  //   async function processOrder () {
  //     try {
  //       const codeCheck = await processPromo();
  //       // Make finalPrice in cents as a number from total
  //       const finalPrice = Math.round(Number(orderToProcess.total) * 100);

  //       charge = {
  //         amount: finalPrice,
  //         currency: 'usd',
  //         customer: stripe_id,
  //         source: source,
  //         description: orderToProcess.packName + " for " + customer.first_name + " " + customer.last_name,
  //         receipt_email: customer.email
  //       };

  //       if (finalPrice > 0) {
  //         // Charge Stripe
  //         const payment = await chargeStripe( charge );
  //         // Set users to TRIALING in Stripe FIX

  //         // Save the Stripe payment_id (FIX how we link the two)
  //         orderToProcess.payment_id = payment.id;
  //         orderToProcess.salePrice = (finalPrice / 100).toFixed(2);
  //       } else {
  //         orderToProcess.salePrice = "0";
  //       };

  //       orderToProcess.paid_at = new Date();

  //       var delDay = $('[name="deliveryWindow"]').val();

  //       customer.amount_spent = orderToProcess.total;
  //       customer.stripe_id = stripe_id;
  //       customer.credit = Math.round(credit * 100) / 100;
  //       // customer.customized = true;
  //       // updateSubscriber();

  //       Meteor.call( 'updateUser', Meteor.userId(), customer, (error,response) => {
  //         if (error) {
  //           throw new Meteor.Error(402, error);
  //           console.log(error);
  //         };
  //       });

  //       const order = Session.get('orderId');
  //       order.recipient = recipient;
  //       order.gift = null;
  //       order.discount = {
  //         subscriber_discount: template.subscriber_discount.get(),
  //         promo: template.promo.get(),
  //         credit: template.appliedCredit.get(),
  //         value: template.discount.get(),
  //       };
  //       order.delivery_fee = template.delivFee.get();
  //       order.subtotal = template.subtotal.get();
  //       order.total = Math.round(template.order.total.get() * 100) / 100;
  //       order.payment_id = orderToProcess.payment_id;
  //       order.paid_at = orderToProcess.paid_at;
  //       order.ready_by = Session.get('menu').ready_by;
  //       order.delivery_window_id = delDay;
  //       order.delivery_comments = comments;

  //       const processedOrder = processSubscriberOrder.call(order, ( error, response ) => {
  //         if(error) {
  //           throw new Meteor.Error(404, error);
  //           sAlert.error(error);
  //           Session.set('loading', false);
  //         } else {
  //           // ga('ec:addProduct', {               // Provide product details in an productFieldObject.
  //           //   'name': orderToProcess.packName,                 // Product name (string).
  //           //   'price': orderToProcess.total,                 // Product price (currency).
  //           //   'coupon': orderToProcess.coupon,          // Product coupon (string).
  //           //   'quantity': 1                     // Product quantity (number).
  //           // });
  //           // ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
  //           //   'id': response._id,// (Required) Transaction id (string).
  //           //   'affiliation': 'Getfednyc.com', // Affiliation (string).
  //           //   'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
  //           //   'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
  //           //   'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
  //           //   'coupon': orderToProcess.coupon, // Transaction coupon (string).
  //           // });
  //           // ga('send', 'event', 'enhanced ecommerce', 'purchase', {'nonInteraction': true});
  //           Meteor.call( 'sendOrderConfirmationEmail', Meteor.userId(), order, ( error, response ) => {
  //             if ( error ) {
  //               console.log(error);
  //             };
  //           }); 
  //         };
  //       });

  //       Session.set('loading', false);
  //       sAlert.success("All done! We'll email you soon with details about your delivery.", { timeout: 'none', onClose: function() { FlowRouter.go('/'); }});       
  //     } catch(error) {
  //       Session.set('loading', false);
  //       throw new Meteor.Error(401, error);
  //     };
  //   };

  //   processOrder();
  // },
});