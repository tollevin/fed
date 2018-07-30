import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { Blaze } from 'meteor/blaze';
// import { HTTP } from 'meteor/http';

// Collections
import { Promos } from '/imports/api/promos/promos.js';
import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

// Methods
import { processOrder } from '/imports/api/orders/methods.js';
import { usePromo } from '/imports/api/promos/methods.js';

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
    this.userHasCredit = new ReactiveVar(0); // Unused credit on user account
    this.zipField = new ReactiveVar(Meteor.user().address_zipcode); // zip field value
    this.userHasPromo = new ReactiveVar(false); // toggle promo input
    this.order = new ReactiveVar(order); // base order
    this.order.coupon = new ReactiveVar(false); // discount.promo.code
    this.order.total = new ReactiveVar(order.total); // order.total
    this.order.subtotal = new ReactiveVar(order.subtotal); // order.subtotal
    this.delivFee = new ReactiveVar(order.delivery_fee); // order.delivery_fee
    this.sources = new ReactiveVar(false); // stored card IDs

    // Discount Vars
    this.discount = new ReactiveVar(order.discount); // discount Object
    this.appliedCredit = new ReactiveVar(0); // discount.credit
    this.newCredit = new ReactiveVar(false); // new user.credit

    // discount.subscriber_discount
    this.subscriber_discounts = new ReactiveVar(order.discount.subscriber_discounts);

    this.promo = new ReactiveVar(null); // discount.promo
    this.discountValue = new ReactiveVar(order.discount.value); // discount.value

    // All reactive data for autorun
    this.autorun(() => {
      const isReady = handle.ready();
      if (isReady && thisUserData.ready()) {
        if (Meteor.userId()) {
          // If the customer has a Stripe ID,
          // we attach it to the template and call a list of their payment sources
          if (!this.stripeId && Meteor.user().stripe_id) {
            this.stripeId = Meteor.user().stripe_id;
            // Call stripe user info
            Meteor.call('retrieveCustomer', this.stripeId, (error, response) => {
              if (error) { return; }
              this.stripeCustomer = response;
              this.sources.set(this.stripeCustomer.sources);
            });
          }

          // Set if user has a credit on account
          if (Meteor.user().credit > 0) {
            const { credit } = Meteor.user();
            this.userHasCredit.set(credit);
          }
        } else {
          FlowRouter.go('/');
        }
      }

      // Reactive vars to be autorun
      if (!this.zipField.get()) this.zipField.set(Meteor.user().profile.zipCode);
      const zip = this.zipField.get();
      const deliveryFees = zipZones[zip].delivery_fees; // FIX BIX

      if (deliveryFees) {
        if (this.order.subtotal.get() > 150) {
          this.delivFee.set(deliveryFees.tier3);
        } else {
          this.delivFee.set(deliveryFees.tier1);
        }
      }

      this.order.total.set(
        (this.order.subtotal.get() * 1.08875)
        + this.delivFee.get()
        - this.discountValue.get(),
      );
    });
  } else {
    sAlert.error('Sorry, your order got tossed! Redirecting you home...', { timeout: 3000, onClose() { FlowRouter.go('/'); } });
  }
});

Template.Checkout_page.onRendered(function checkoutPageOnRendered() {

});

Template.Checkout_page.onDestroyed(function checkoutPageOnDestroyed() {

});

Template.Checkout_page.helpers({
  packItems() {
    const order = Session.get('Order');
    if(!order) { return undefined; }
    const itemList = order.items;
    const itemTally = {};

    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (!itemTally[itemList[i].name]) {
        itemTally[itemList[i].name] = 1;
      } else {
        itemTally[itemList[i].name] += 1;
      }
    }

    const result = Object.entries(itemTally).map(([name, value]) => ({ name, value }));
    return result;
  },

  isPlan(item) {
    const order = Session.get('Order');
    if(!order) { return undefined; }

    const { subscriptions } = order;
    if (!subscriptions) { return undefined; }
    for (let i = subscriptions.length - 1; i >= 0; i -= 1) {
      const subItemName = subscriptions[i].item_name;
      if (subItemName === item.name) return true;
    }
    return undefined;
  },

  price() {
    return `$${Template.instance().order.subtotal.get().toFixed(2)}`;
  },

  tax() {
    return `$${(Template.instance().order.subtotal.get() * 0.08875).toFixed(2)}`;
  },

  deliveryFee() {
    const delivFee = Template.instance().delivFee.get();

    if (delivFee > 0) {
      return `$${delivFee.toFixed(2)}`;
    }
    return 'FREE';
  },

  userHasCredit() {
    if (Template.instance().order.total.get() > 0
        && Template.instance().userHasCredit.get()
        && !(Template.instance().appliedCredit.get())) {
      return `$${Template.instance().userHasCredit.get().toFixed(2)}`;
    }
    return false;
  },

  appliedCredit() {
    const appliedCredit = Template.instance().appliedCredit.get();
    return appliedCredit && appliedCredit.toFixed(2);
  },

  subDiscount() {
    const subDiscounts = Template.instance().subscriber_discounts.get();
    const couponDiscount = Template.instance().promo.get();
    const couponValue = (couponDiscount && couponDiscount.value) || 0;
    const totalDiscounts = Template.instance().discountValue.get();
    const appliedCredit = Template.instance().appliedCredit.get();
    return subDiscounts[0] && (totalDiscounts - couponValue - appliedCredit).toFixed(2);
  },

  couponDiscount() {
    const couponDiscount = Template.instance().promo.get();
    return couponDiscount && couponDiscount.value.toFixed(2);
  },

  total() {
    return `$${Template.instance().order.total.get().toFixed(2)}`;
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
    const { preferredDelivDay } = Meteor.user();
    if (!preferredDelivDay) { return undefined; }
    return preferredDelivDay;
  },

  deliveryWindows() {
    return DeliveryWindows.find({}, { sort: { delivery_start_time: 1 } });
  },

  toDateStr(date) {
    const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
    const dateToString = `${moment(date).format('dddd, MMMM Do, h')}-${endDate.format('ha')}`;
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
    if (Meteor.userId() && Meteor.user().subscriptions && (Meteor.user().subscriptions.status !== 'canceled')) {
      return 'Save';
    }
    return 'Buy';
  },

  disabled() {
    return Session.get('loading') && 'disabled';
  },
});

Template.Checkout_page.events({
  'click .enterPromo' (event) {
    event.preventDefault();

    Template.instance().userHasPromo.set(true);
  },

  'change #r6HB6YfaegNsAKBTS'(event, templateInstance) {
    event.preventDefault();

    const newZip = event.target.value;
    templateInstance.zipField.set(newZip);
  },

  'click #promoSub'(event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    const code = templateInstance.find('[id="promo"]').value.toUpperCase();
    const user = Meteor.userId();
    templateInstance.subscribe('single.promo', code, {
      onReady () {
        Session.set('newUser', false);

        const promo = Promos.findOne({ code });

        if (promo && !promo.active) {
          sAlert.error('Sorry, that code is no longer valid.');
        }
        if (promo && promo.users[user] === promo.useLimitPerCustomer) {
          sAlert.error('Sorry, that code has already been used.');
          return;
        }
        if (promo && promo.credit) {
          // Get existing total
          const total = templateInstance.order.total.get();
          // Get existing discount
          const discount = templateInstance.discountValue.get();

          // Ready discount.promo
          const discountPromo = {
            type: 'credit',
            code,
            description: promo.desc,
          };

          // Subtract promo.credit from existing total
          const newTotal = total - promo.credit;

          if (newTotal < 0) {
            let newCredit = 0 - newTotal;
            // FIX if (!Meteor.userId()) for future gifts purchases {

            // Set user credit
            const origCredit = templateInstance.newCredit.get()
              || templateInstance.userHasCredit.get();
            newCredit = origCredit + (Math.round(newCredit * 100) / 100);
            templateInstance.newCredit.set(newCredit);

            // Set discount.value
            const newDiscount = discount + total;
            templateInstance.discountValue.set(newDiscount);

            // Set discount.promo.value
            discountPromo.value = total;

            // FIX Notifications!
            sAlert.success(`You now have a credit of $${newCredit.toFixed(2)}.`);
          } else {
            // Set discount.value
            const newDiscount = discount + promo.credit;
            templateInstance.discountValue.set(newDiscount);

            // Set discount.promo.value
            discountPromo.value = promo.credit;
          }

          // Set discount.promo
          templateInstance.promo.set(discountPromo);
          return;
        }
        if (promo && promo.percentage) { return; }
        sAlert.error("Sorry, that code isn't recognized");
      },
      onError () {
        sAlert.error("Sorry, that code isn't recognized");
      },
    });

    Session.set('loading', false);
    templateInstance.userHasPromo.set(false);
  },

  'click #applyCredit'(event, templateInstance) {
    event.preventDefault();

    const credit = templateInstance.newCredit.get() || templateInstance.userHasCredit.get();
    const discount = templateInstance.discountValue.get();
    const total = templateInstance.order.total.get();

    if (total <= 0) { return; }
    if (total < credit) {
      const newCredit = credit - total;
      templateInstance.discountValue.set(total + discount);
      templateInstance.appliedCredit.set(total);
      sAlert.success(`You now have a credit of $${newCredit.toFixed(2)}.`);
      templateInstance.newCredit.set(newCredit);
      return;
    }
    templateInstance.appliedCredit.set(credit);
    templateInstance.discountValue.set(discount + credit);
    templateInstance.newCredit.set(0);
    sAlert.success(`$${credit.toFixed(2)} worth of FedCred has been applied!`);
  },

  'blur #address-zip'(event) {
    const { value } = event.currentTarget;
    if (!zipZones[value]) {
      const errorElement = document.getElementById('zip-errors');
      errorElement.textContent = 'Sorry, but we only deliver to Brooklyn, Queens, and Manhattan at this time.';
    }
  },

  'submit #insertOrderForm'(event, templateInstance) {
    event.preventDefault();
    Session.set('loading', true);

    const orderToProcess = templateInstance.order.get();

    orderToProcess.total = templateInstance.order.total.get().toFixed(2);

    const customer = {
      first_name: templateInstance.find('[name="customer.firstName"]').value,
      last_name: templateInstance.find('[name="customer.lastName"]').value,
      phone: templateInstance.find('[name="customer.phone"]').value,
      email: templateInstance.find('[name="customer.email"]').value,
      address_line_1: templateInstance.find('[name="customer.address.line1"]').value,
      address_line_2: templateInstance.find('[name="customer.address.line2"]').value,
      address_city: templateInstance.find('[name="customer.address.city"]').value,
      address_state: templateInstance.find('[name="customer.address.state"]').value,
      address_zipcode: templateInstance.find('[name="customer.address.zipCode"]').value,
    };
    orderToProcess.recipient = customer;
    orderToProcess.delivery_comments = templateInstance.find('[name="destinationComments"]').value;

    let credit;
    if (templateInstance.newCredit.get()) {
      credit = templateInstance.newCredit.get();
    } else {
      credit = templateInstance.userHasCredit.get();
    }

    let { stripeId } = templateInstance;

    const finalPrice = Math.round(Number(orderToProcess.total) * 100);

    const callWithPromise = (method, myParameters) => new Promise((resolve, reject) => {
      Meteor.call(method, myParameters, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });

    async function processPromo() {
      try {
        const promo = templateInstance.promo.get();
        const code = promo && promo.code.toUpperCase();
        if (code) {
          usePromo.call({
            code,
          }, (err, res) => {
            if (err) {
              return (err);
            }
            return (res);
          });
        }
      } catch (error) {
        sAlert.error(error.reason);
      }
    }

    async function createStripeTokenFromElement() {
      try {
        const childView = Blaze.getView(templateInstance.find('#card-element'));
        const childTemplateInstance = childView._templateInstance;
        const { card, stripe } = childTemplateInstance;
        const { token } = await stripe.createToken(card);
        return token;
      } catch (error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
      return undefined;
    }

    async function createStripeCustomer(cust) {
      try {
        const newStripeCustomer = await callWithPromise('createCustomer', cust);
        return newStripeCustomer;
      } catch (error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
      return undefined;
    }

    async function chargeStripe(charge) {
      try {
        return await callWithPromise('processPayment', charge);
      } catch (error) {
        // Inform the customer that there was an error
        const errorElement = document.getElementById('payment-errors');
        errorElement.textContent = error.message;
        Session.set('loading', false);
      }
      return undefined;
    }

    async function processSingleOrder () {
      try {
        // if promo used, process
        await processPromo();

        // Make finalPrice in cents as a number from total
        let charge;

        // If user already has a Stripe customer ID
        if (stripeId) {
          const source = templateInstance.find('[id="Source"]').value;
          charge = {
            amount: finalPrice,
            currency: 'usd',
            customer: stripeId,
            source,
            description: `Order for ${customer.first_name} ${customer.last_name}`,
            receipt_email: customer.email,
          };
        // Else if new customer
        } else {
          const token = await createStripeTokenFromElement();
          const cust = {
            description: `Customer for ${customer.first_name} ${customer.last_name}`,
            source: token.id,
            account_balance: 0,
            email: customer.email,
          };

          const newStripeCustomer = await createStripeCustomer(cust);
          // console.log(newStripeCustomer);
          stripeId = newStripeCustomer.id;
          charge = {
            amount: finalPrice,
            currency: 'usd',
            customer: stripeId,
            description: `Order for ${customer.first_name} ${customer.last_name}`,
            receipt_email: customer.email,
          };
        }

        // If final price is positive, charge stripe
        if (finalPrice > 0) {
          // Charge Stripe
          const payment = await chargeStripe(charge);
          // console.log(payment);
          orderToProcess.payment_id = payment.id;
          orderToProcess.total = Number((finalPrice / 100).toFixed(2));
        } else {
          orderToProcess.total = 0;
        }

        orderToProcess.paid_at = new Date();

        const delDay = $('[name="deliveryWindow"]').val();

        customer.amount_spent = orderToProcess.total;
        customer.stripe_id = stripeId;
        customer.credit = Math.round(credit * 100) / 100;
        const user = Meteor.user();

        Meteor.call('updateUser', user._id, customer);

        const order = Session.get('Order');
        order.recipient = customer;
        order.gift = null;
        order.discount = {
          subscriber_discounts: templateInstance.subscriber_discounts.get(),
          promo: templateInstance.promo.get(),
          credit: templateInstance.appliedCredit.get(),
          value: templateInstance.discountValue.get(),
        };
        order.delivery_fee = templateInstance.delivFee.get();
        order.subtotal = templateInstance.order.subtotal.get();
        order.total = Math.round(templateInstance.order.total.get() * 100) / 100;
        order.payment_id = orderToProcess.payment_id;
        order.paid_at = orderToProcess.paid_at;
        order.ready_by = Session.get('menu').ready_by;
        order.delivery_window_id = delDay;
        order.delivery_comments = orderToProcess.delivery_comments;

        processOrder.call(order, (error, response) => {
          if (error) {
            sAlert.error(error);
            Session.set('loading', false);
            throw new Meteor.Error(404, error);
          } else {
            Session.set('Order', null);
            Session.set('orderId', response);

            Meteor.call('sendOrderConfirmationEmail', Meteor.userId(), order, () => {});
          }
        });

        Session.set('loading', false);
        FlowRouter.go('Confirmation');
      } catch (error) {
        Session.set('loading', false);
        throw new Meteor.Error(401, error);
      }
    }

    processSingleOrder();
  },
});
