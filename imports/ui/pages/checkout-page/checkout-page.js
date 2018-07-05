import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import moment from 'moment';
// import { HTTP } from 'meteor/http';

// Collections
import { Items } from '/imports/api/items/items.js';
import { Orders } from '/imports/api/orders/orders.js';
import { Promos } from '/imports/api/promos/promos.js';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

// Methods
import { processOrder } from '/imports/api/orders/methods.js';
import { usePromo } from '/imports/api/promos/methods.js';
import { subscribeToPlan } from '/imports/api/plans/methods.js';

// Components
import '/imports/ui/components/loader/loader.js';
import '/imports/ui/components/stripe-card-element/stripe-card-element.js';

// Template
import './checkout-page.less';
import './checkout-page.html';

Template.Checkout_page.onCreated(function checkoutPageOnCreated() {
  // Create a handle for subscription to this 'single.order', 'thisUserData'
  if (Session.get('Order')) {
    const handle = this.subscribe('single.order', Session.get('Order')._id);
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
    this.order.total = new ReactiveVar(order.total);  // order.total
    this.order.subtotal = new ReactiveVar(order.subtotal);  // order.subtotal
    this.delivFee = new ReactiveVar(order.delivery_fee);  // order.delivery_fee
    this.sources = new ReactiveVar(false); // stored card IDs

    // Discount Vars
    this.discount = new ReactiveVar(order.discount);  // discount Object
    this.appliedCredit = new ReactiveVar(0);  // discount.credit
    this.newCredit = new ReactiveVar(false); // new user.credit
    this.subscriber_discounts = new ReactiveVar(order.discount.subscriber_discounts);  // discount.subscriber_discount
    this.promo = new ReactiveVar(null);  // discount.promo
    this.discountValue = new ReactiveVar(order.discount.value); // discount.value    

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
    var subscriptions = Session.get('Order').subscriptions;
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
    const delivFee = Template.instance().delivFee.get();

    if (delivFee > 0) {
      return "$" + delivFee.toFixed(2);
    } else {
      return "FREE";
    };
  },

  userHasCredit() {
    if (Template.instance().order.total.get() > 0 && Template.instance().userHasCredit.get() && !(Template.instance().appliedCredit.get())) {
      return "$" + Template.instance().userHasCredit.get().toFixed(2);
    } else {
      return false;
    }
  },

  appliedCredit() {
    const appliedCredit = Template.instance().appliedCredit.get();
    return appliedCredit && appliedCredit.toFixed(2);
  },

  subDiscount() {
    const subDiscounts = Template.instance().subscriber_discounts.get();
    const couponDiscount = Template.instance().promo.get();
    const couponValue = couponDiscount && couponDiscount.value || 0;
    var totalDiscounts = Template.instance().discountValue.get();
    var appliedCredit = Template.instance().appliedCredit.get();
    return subDiscounts[0] && (totalDiscounts - couponValue - appliedCredit).toFixed(2);
  },

  couponDiscount() {
    const couponDiscount = Template.instance().promo.get();
    return couponDiscount && couponDiscount.value.toFixed(2);
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

  'click #promoSub'(event, template) {
    event.preventDefault();
    Session.set('loading', true);

    const code = template.find('[id="promo"]').value.toUpperCase();
    const user = Meteor.userId();
    template.subscribe('single.promo', code, {
      onReady: function () {
        Session.set('newUser', false);

        const promo = Promos.findOne({code: code});
        const origPriceWTax = Math.round(template.price * 108.875) / 100;
        
        if (promo && !promo.active) {
          sAlert.error('Sorry, that code is no longer valid.');
        } else if (promo.users[user] === promo.useLimitPerCustomer) {
          sAlert.error('Sorry, that code has already been used.');
        } else if (promo && promo.credit) {
          // Get existing total
          var total = template.order.total.get();
          // Get existing discount
          var discount = template.discountValue.get();

          // Ready discount.promo
          var discountPromo = {
            type: 'credit',
            code: code,
            description: promo.desc,
          };

          // Subtract promo.credit from existing total
          var newTotal = total - promo.credit;
          
          if (newTotal < 0) {
            var newCredit = 0 - newTotal;
            // FIX if (!Meteor.userId()) for future gifts purchases {

            // Set user credit
            var origCredit = template.newCredit.get() || template.userHasCredit.get();
            var newCredit = origCredit + (Math.round(newCredit * 100) / 100);
            template.newCredit.set(newCredit); 
            
            // Set discount.value
            var newDiscount = discount + total;
            template.discountValue.set( newDiscount );

            // Set discount.promo.value
            discountPromo.value = total;

            // FIX Notifications!
            sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
          } else {
            // Set discount.value
            var newDiscount = discount + promo.credit;
            template.discountValue.set( newDiscount );

            // Set discount.promo.value
            discountPromo.value = promo.credit;            
          };
          
          // Set discount.promo
          template.promo.set(discountPromo);
        } else if (promo && promo.percentage) {

        } else {
          sAlert.error("Sorry, that code isn't recognized");
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


    const credit = template.newCredit.get() || template.userHasCredit.get();
    const discount = template.discountValue.get();
    const total = template.order.total.get();

    if (total > 0) {
      var newDiscount = discount + credit;
      if (total < credit) {
        const newCredit = credit - total;
        // template.order.coupon.set( "ACCOUNT CREDIT of" + total );
        template.discountValue.set( total + discount );
        template.appliedCredit.set( total );
        // template.discount.set( template.order.total.get() );
        sAlert.success('You now have a credit of $' + newCredit.toFixed(2) + ".");
        template.newCredit.set( newCredit );
      } else {
        // template.order.coupon.set( "ACCOUNT CREDIT OF" + credit );
        template.appliedCredit.set( credit );
        template.discountValue.set( discount + credit );
        template.newCredit.set( 0 );
        // template.discountValue.set("- $" + credit);
        // template.discount.set( credit );
        sAlert.success('$' + credit.toFixed(2) + " worth of FedCred has been applied!");
      };
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
    if (template.newCredit.get()) {
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
        const promo = template.promo.get();
        const code = promo && promo.code.toUpperCase();
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
        // if promo used, process
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

        customer.amount_spent = orderToProcess.total;
        customer.stripe_id = stripe_id;
        customer.credit = Math.round(credit * 100) / 100;
        var user = Meteor.user();
        
        Meteor.call( 'updateUser', user._id, customer );

        const order = Session.get('Order');
        order.recipient = customer;
        order.gift = null;
        order.discount = {
          subscriber_discounts: template.subscriber_discounts.get(),
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

    processSingleOrder();
  },
});