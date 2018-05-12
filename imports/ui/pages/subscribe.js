import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import { Accounts } from 'meteor/accounts-base';
import moment from 'moment';
import { ReactiveVar } from 'meteor/reactive-var';
import { lodash } from 'meteor/erasaur:meteor-lodash';
// import { HTTP } from 'meteor/http';

import { DeliveryWindows } from '../../api/delivery/delivery-windows.js';
import { Promos } from '../../api/promos/promos.js';
import { Items } from '../../api/items/items.js';

import { updateOrder } from '../../api/orders/methods.js';
import { usePromo } from '../../api/promos/methods.js';

import { ALL_FOODS, VEGETARIAN_FOODS, VEGAN_FOODS, PESCATARIAN_FOODS, PALEO_FOODS }
  from './pack_picker/diet_food_restrictions.js';
import { generateDefaultPack, getPack } from './pack_picker/pack_planner.js';

// Methods
import { 
  checkForPlan,
  insertPlan
} from '../../api/plans/methods.js';


// Template
import './subscribe.html';

// Components
import '../components/trial-signup.js';
// import '../components/loader.js';
import '../components/pack-schemas.js';
import '../components/stripe-card-element.js';
import '../components/delivery-day-toggle.js';
import '../components/pack-editor.js';




Template.Subscribe.onCreated(function subscribeOnCreated() {
  if (!Meteor.userId()) {
    FlowRouter.go('join');
  };

  this.userHasPromo = new ReactiveVar(false);
	Session.set('cartOpen', false);
  Session.setDefault('stage', 0);
  this.diet = new ReactiveVar('omnivore');
  this.restrictions = new ReactiveVar([]);
  this.preferredDelivDay = new ReactiveVar('sunday');
  this.skip_first_delivery = new ReactiveVar(false);
  this.menu_id = new ReactiveVar(false);

  const now = moment().toDate();

  this.autorun(() => {
    this.subscribe('thisUserData');
    this.subscribe('DeliveryWindows.nextTwoWeeks', now);
    this.subscribe('Items.packs');
    // this.subscribe('Menus.active');
  });
});

Template.Subscribe.onRendered(function freeTrialOnRendered() {
  Session.set('loading', false);
});

Template.Subscribe.helpers({
  trialable() {
    return !Meteor.userId();
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
        var cf = 'meals';
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
    return ALL_FOODS;
  },

  plan() {
    return (Session.get('stage') === 1);
  },

  meals() {
    return (Session.get('stage') === 2);
  },

  delivery() {
    return (Session.get('stage') === 3);
  },

  userDiet() {
    return Template.instance().diet.get();
  },

  thisWeek: ()=> {
    const skipping = Template.instance().skip_first_delivery.get();
    if (!skipping) {
      const preferredDelivDay = Template.instance().preferredDelivDay.get();
      const deliveries = DeliveryWindows.find({'delivery_day': preferredDelivDay}).fetch();
      const delivery = deliveries[0];
      const date = moment(delivery.delivery_start_time);
      const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
      const dateToString = date.format("dddd, MMMM Do, h") + '-' + endDate.format("ha");
      return dateToString;
    }
  },

  nextWeek: ()=> {
    const preferredDelivDay = Template.instance().preferredDelivDay.get();
    const deliveries = DeliveryWindows.find({'delivery_day': preferredDelivDay}).fetch();
    const delivery = deliveries[1];
    const date = moment(delivery.delivery_start_time);
    const endDate = moment(date).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
    const dateToString = date.format("dddd, MMMM Do, h") + '-' + endDate.format("ha");
    return dateToString;
  },

  havePromo() {
    return Template.instance().userHasPromo.get();
  },
});

Template.Subscribe.events({

  // 'click .enterPromo'(event,template) {
  //   event.preventDefault();

  //   Template.instance().userHasPromo.set(true);
  // },

  // 'click #promoSub'(event, template) {
  //   event.preventDefault();
  //   Session.set('loading', true);
  //   var formdata = Session.get('formData');
  //   formdata.account_balance = 0;


  //   // async function processPromo() {
  //   //   try {
  //   //     const code = orderToProcess.coupon;
  //   //     var codeCheck = false;
  //   //     if (code) {
  //   //       usePromo.call({
  //   //         code: code
  //   //       }, (err, res) => {
  //   //         if (err) {
  //   //           return(err);
  //   //         } else {
  //   //           return(res);
  //   //         };
  //   //       });
  //   //     };
  //   //   } catch(error) {
  //   //     sAlert.error(error.reason);
  //   //   };
  //   // };


  //   const code = template.find('[id="promo"]').value.toUpperCase();
  //   template.subscribe('single.promo', code, {
  //     onReady: function () {
  //       Session.set('newUser', false);

  //       const promo = Promos.findOne({code: code});
        
  //       if (promo && !promo.active) {
  //         sAlert.error('Sorry, that code is no longer valid.');
  //         formdata.account_balance = 0;
  //         Session.set('formData', formdata);
  //       } else if (promo && promo.credit) {
  //         var credit = 0 - (promo.credit * 100);
  //         formdata.account_balance = credit;
  //         Session.set('formData', formdata);
  //         sAlert.success('You now have a credit of $' + promo.credit.toFixed(2) + ".");
  //         usePromo.call({code: code});
  //       } else if (promo && promo.percentage && (promo.useLimitPerCustomer === 0)) {
  //         formdata.percentOff = promo.percentage;
  //         Session.set('formData', formdata);
  //         sAlert.success("Lucky you! You get " + formdata.percentOff + "% off!");
  //         usePromo.call({code: code});
  //       } else if ( promo && code === 'FED40') {
  //         formdata.percentOff = promo.percentage;
  //         formdata.newTrialCustomer = true;
  //         Session.set('formData', formdata);
  //         sAlert.success("You get " + formdata.percentOff + "% off your first week!");
  //         usePromo.call({code: code});
  //       } else {
  //         formdata.account_balance = 0;
  //         Session.set('formData', formdata);
  //         sAlert.error("Sorry, that code doesn't work for subscriptions!");
  //       };
  //     },
  //     onError: function () {
  //       sAlert.error("Sorry, that code isn't recognized");
  //       formdata.account_balance = 0;
  //       Session.set('formData', formdata);
  //     },
  //   });

  //   Session.set('loading', false);
  //   template.userHasPromo.set( false );
  // },

  'click .diet label, touchstart .diet label'(event, template) {
    event.preventDefault();

    const diets = template.findAll('.diet > label');
    for (var i = diets.length - 1; i >= 0; i--) {
      diets[i].classList.remove('clicked')
    };

    event.currentTarget.classList.add('clicked');

    const foodNamesToClasses = (foodList) => foodList.map((foodStr) => `.${foodStr}`).join(", ");
    const foodNamesToIds = (foodList) => foodList.map((foodStr) => `#${foodStr}`).join(", ");
    const notEatenFoods = (foodList) => lodash.difference(ALL_FOODS, foodList);

    const selectRelevantFoods = (foodList) => {
      template
        .findAll(foodNamesToIds(ALL_FOODS))
        .forEach((element) => element.classList.remove('checked'));

      template
        .findAll(foodNamesToClasses(ALL_FOODS))
        .forEach((element) => element.classList.remove('fadeIn'));

      template
        .findAll(foodNamesToIds(notEatenFoods(foodList)))
        .forEach((element) => element.classList.add('checked'));

      template
        .findAll(foodNamesToClasses(notEatenFoods(foodList)))
        .forEach((element) => element.classList.add('fadeIn'));
    }

    const dietNameToFoodTypeArray = (dietName) => {
      switch (dietName) {
        case 'Omnivore':
          return ALL_FOODS;
        case 'Vegetarian':
          return VEGETARIAN_FOODS;
        case 'Vegan':
          return VEGAN_FOODS;
        case 'Pescetarian':
          return PESCATARIAN_FOODS;
        case 'Paleo':
          return PALEO_FOODS;
        default:
          return ALL_FOODS;
      }
    }

    const dietName = event.target.closest("li").id;
    const foodTypeArray = dietNameToFoodTypeArray(dietName);

    //////////// Experiment Pack Genration Code Start /////////////
    // const packType = {name: "paleo", number: 12};
    // const packItems = Items.find({category: "Pack"}).fetch();
    // const pack = getPack(packItems, packType);
    // const items = Items.find({category: "Meal"}).fetch();
    // const res = generateDefaultPack(pack, foodTypeArray, items, items, packItems);
    // console.log("res = %j", res);
    //////////// Experiment Pack Genration Code End /////////////

    selectRelevantFoods(foodTypeArray);
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

    var diet = template.find('.clicked');
    
    if (!diet) {
      sAlert.error("Please choose a type of diet.");
      Session.set('loading', false);
    } else {
      template.diet.set(diet.innerText);
      var restrictions = template.findAll('.checked');
      var restrictionsArray = [];
      for (var i = restrictions.length - 1; i >= 0; i--) {
        restrictionsArray.push(restrictions[i].id);
      };
      template.restrictions.set(restrictionsArray);

      $('.content-scrollable').scrollTop(0, 2000);
      Session.set('loading', false);
      Session.set('stage', 1);
    };
  },

  'click #Plan li label'(event, template) {

    const plans = template.findAll("#Plan li label");
    for (var i = plans.length - 1; i >= 0; i--) {
      plans[i].classList.remove('chosen');
    };
    event.currentTarget.classList.add('chosen');
    const checked = event.currentTarget.firstElementChild.checked;
    event.currentTarget.firstElementChild.checked = true;
  },

  'change #delivery-day-checkbox'(event, template) {
    if (document.getElementById('delivery-day-checkbox').checked) {
      template.preferredDelivDay.set('monday');
    } else {
      template.preferredDelivDay.set('sunday');
    }
  },

  'click #skip-first-delivery'(event, template) {
    event.preventDefault();

    template.skip_first_delivery.set(true)
  },

  'click #unskip-first-delivery'(event, template) {
    event.preventDefault();

    template.skip_first_delivery.set(false)
  },

  'click #next1'(event, template) {
    event.preventDefault();
    const packSelected = document.querySelector('input[name="plan"]:checked');

    if (packSelected) {
      Session.set('loading', true);

      const packName = document.querySelector('input[name="plan"]:checked').value;
      const deliveryDay = template.preferredDelivDay.get();
      const skipping = template.skip_first_delivery.get();
      const week_of = skipping ? moment().add(1,'week').startOf('week').toDate() : moment().startOf('week').toDate();
      var pack = Items.findOne({name: packName});
      // pack.discount = {
      //   subscriber_discount: {
      //     percent: 5,
      //     value: .05 * pack.price_per_unit,
      //   }
      // },

      // check if plan exists
      const data = {
        item_id: pack._id,
        quantity: 1,
        frequency: 7,
      };

      var planExists = pack.plans(data);
      console.log(planExists);

      // if !plan, insert plan
      if (!planExists) {
        planExists = insertPlan.call(data);
      };

      planExists.item_name = packName;

      let order;
      if (Session.get('Order')) {
        order = Session.get('Order');
        order.style = 'pack';

        // Check to see if pack subscription exists, 'Add another?/Edit' prompt
        order.items ? order.items.push(pack) : order.items = [pack];

        if (order.subscriptions) {
          order.subscriptions.push(planExists);
        } else {
          order.subscriptions = [planExists];
        };
      } else {
        order = {
          user_id: Meteor.userId(),
          week_of: week_of,
          items: [
            pack
          ],
          created_at: moment().toDate(),
          style: 'pack',
          subscriptions: [ planExists ]
        };
      };

      var diet = template.diet.get();
      var dietToUpperCase = diet[0].toUpperCase() + diet.slice(1);
      var restrictionsArray = template.restrictions.get();
      var restrictionsObject = {
        peanuts: false,
        treenuts: false,
        soy: false,
        beef: false,
        chicken: false,
        fish: false,
        shellfish: false,
        milk: false,
        eggs: false,
        wheat: false,
      };
      var restrictions = Object.keys(restrictionsObject);

      for (var i = restrictionsArray.length - 1; i >= 0; i--) {
        restrictionsObject[restrictionsArray[i]] = true;
      };

      var filters = {
        diet: dietToUpperCase,
        restrictions: restrictionsObject,
      };

      // FIX you're not saving their restriction settings...
      Session.set('filters', filters);
      Session.set('Order', order);
      Session.set('loading', false);
      Session.set('stage', 2);

      var userData = {
        restrictions: restrictionsArray,
        diet: filters.diet,
        preferred_deliv_windows: deliveryDay
      };

      Meteor.call('updateUser', Meteor.userId(), userData);
    } else {
      sAlert.error("Please choose a plan");
    };
  },

  // 'submit #cc-form'(event, template) {
  //   event.preventDefault();
  //   Session.set('loading', true);
  //   var formdata = Session.get('formData');

  //   const callWithPromise = (method, myParameters) => {
  //     return new Promise((resolve, reject) => {
  //       Meteor.call(method, myParameters, (err, res) => {
  //         if (err) {
  //           reject(err);
  //         };
  //         resolve(res);
  //       });
  //     });
  //   };

  //   async function createStripeTokenFromElement() {
  //     try {
  //       var childView = Blaze.getView(template.find('#card-element'));
  //       var childTemplateInstance = childView._templateInstance;
  //       var card = childTemplateInstance.card;
  //       var stripe = childTemplateInstance.stripe;
  //       const {token, error} = await stripe.createToken(card);
  //       return token;
  //     } catch(error) {
  //       // Inform the customer that there was an error
  //       const errorElement = document.getElementById('card-errors');
  //       errorElement.textContent = error.message;
  //       Session.set('loading', false);
  //     };
  //   };

  //   // async function createStripeToken() {
  //   //   try {
  //   //     const {token, error} = await stripe.createToken(card);
  //   //     return token;
  //   //   } catch(error) {
  //   //     // Inform the customer that there was an error
  //   //     console.log(error);
  //   //     const errorElement = document.getElementById('card-errors');
  //   //     errorElement.textContent = error.message;
  //   //     Session.set('loading', false);
  //   //   };
  //   // };

  //   // async function createStripeCustomer(cust) {
  //   //   try {
  //   //     const newStripeCustomer = await callWithPromise('createCustomer', cust );
  //   //     return newStripeCustomer;
  //   //   } catch(error) {
  //   //     sAlert.error(error.reason);
  //   //     throw new Meteor.Error(411,'createStripeCustomer failed');
  //   //     Session.set('loading', false);
  //   //   }
  //   // };

  //   async function chargeStripe(charge) {
  //     try {
  //       const newCharge = await callWithPromise( 'processPayment', charge );
  //       return newCharge;
  //     } catch(error) {
  //       // sAlert.error(error.reason);
  //       // Inform the customer that there was an error
  //       const errorElement = document.getElementById('payment-errors');
  //       errorElement.textContent = error.message;
  //       Session.set('loading', false);
  //     };
  //   };

  //   // async function createStripeCustomer(cust) {
  //   //   try {
  //   //     const newStripeCustomer = await callWithPromise('createCustomer', cust );
  //   //     return newStripeCustomer;
  //   //   } catch(error) {
  //   //     // Inform the customer that there was an error
  //   //     const errorElement = document.getElementById('payment-errors');
  //   //     errorElement.textContent = error.message;
  //   //     Session.set('loading', false);
  //   //   }
  //   // };

  //   async function createStripeCustomer() {
  //     try {
  //       const token = await createStripeTokenFromElement();
      
  //       if (Meteor.userId()) {
  //         formdata.email = Meteor.user().emails[0].address;
  //       } else {
  //         formdata.email = $('#EsBbF9Ads8fEFFAut').val();
  //       };

  //       const cust = {
  //         description: "Customer for " + formdata.email,
  //         source: token.id,
  //         email: formdata.email,
  //         account_balance: formdata.account_balance || 0,
  //       };

  //       const stripe_id = await callWithPromise( 'createCustomer', cust );
            
  //       formdata.stripe_id = stripe_id.id;
  //       Session.set('formData', formdata);
  //       $('.content-scrollable').scrollTop(0, 2000);
  //       Session.set('loading', false);
  //       Session.set('stage', 3);
  //     } catch(error) {
  //       // Inform the customer that there was an error
  //       const errorElement = document.getElementById('payment-errors');
  //       errorElement.textContent = error.message;
  //       Session.set('loading', false);
  //     };
  //   };

  //   async function createUser(cust) {
  //     try {
  //       const newUser = await callWithPromise( 'createSubscriber', cust );
  //       Meteor.loginWithPassword(user.email, user.password);
  //       return newUser;
  //     } catch(error) {
  //       $('#createNewUser').find('.email-errors').text(error.reason);
  //       throw new Meteor.Error(401, 'createUser failed');
  //       Session.set('loading', false);
  //     };
  //   };

  //   //if NEW USER, create new account
  //   if (!Meteor.userId()) {
  //     var user = {
  //       email: $('#EsBbF9Ads8fEFFAut').val(),
  //       emailCheck: $('#EsBbF9Ads8fEFFAut2').val(),
  //       password: $('#EsBbF9Ads8fEFFAut3').val(),
  //       zipCode: $('#accountzip').val(),
  //     };
  //     //if !PASSWORD-MATCH alert user
  //     if (user.email != user.emailCheck) {
  //       Session.set('loading', false);
  //       $('#createNewUser').find('.email-errors').text("Passwords do not match. Please check and try again.");
  //     } else {
  //       const newUser = createUser(user);
  //       const newStripeCustomer = createStripeCustomer();
  //     };
  //   } else {
  //     createStripeCustomer();
  //   };
  // },

  // 'submit #DeliveryForm'(event,template) {
  //   event.preventDefault();
  //   // var f = template.find('#DeliveryForm');
  //   // if(f.checkValidity()) {
  //   Session.set('loading', true);

  //   var formdata = Session.get('formData');
  //   formdata.first_name = template.find('[name="customer.firstName"]').value;
  //   formdata.last_name = template.find('[name="customer.lastName"]').value;
  //   formdata.phone = template.find('[name="customer.phone"]').value;
  //   formdata.address_line_1 = template.find('[name="customer.address.line1"]').value;
  //   formdata.address_line_2 = template.find('[name="customer.address.line2"]').value;
  //   formdata.address_city = template.find('[name="customer.address.city"]').value;
  //   formdata.address_state = template.find('[name="customer.address.state"]').value;
  //   formdata.address_zipcode = template.find('[name="customer.address.zipCode"]').value;
  //   formdata.comments = template.find('[name="destinationComments"]').value;

  //   const packPrefix = formdata.plan.split("-")[0] + "PP";
  //   var packSuffix = "";

  //   if(MH.indexOf(formdata.address_zipcode) > -1) {
  //     packSuffix = "MH";
  //   };
  //   if (MH_20.indexOf(formdata.address_zipcode) > -1) {
  //     packSuffix = "MH20";
  //   };

  //   formdata.planCode = packPrefix + packSuffix;

  //   const today = new moment();
  //   var nextThursday;
  //   if (today.day() < 4) {
  //     nextThursday = 4 - today.day();
  //   } else {
  //     nextThursday = 11 - today.day();
  //   };

  //   let sub;

  //   if (formdata.newTrialCustomer) {
  //     sub = {
  //       customer: formdata.stripe_id,
  //       plan: formdata.planCode,
  //       trial_period_days: nextThursday,
  //       tax_percent: 8.875,
  //       coupon: "Sub40",
  //     };
  //   } else {
  //     sub = {
  //       customer: formdata.stripe_id,
  //       plan: formdata.planCode,
  //       trial_period_days: nextThursday,
  //       tax_percent: 8.875,
  //       coupon: formdata.percentOff || "Sub5"
  //     };
  //   }
    

  //   Meteor.call( 'subscribeCustomer', sub, (err, response) => {
  //     if ( err ) {
  //       sAlert.error(err);
  //       Session.set('loading', false);
  //     } else {
  //       formdata.subscriptions = response;

  //       const amount_spent = 0;

  //       const user_credit = 0 - formdata.account_balance / 100;

  //       const user = {
  //         "first_name": formdata.first_name,
  //         "last_name": formdata.last_name,
  //         "email": formdata.email,
  //         "phone": formdata.phone,
  //         "address_line_1": formdata.address_line_1,
  //         "address_line_2": formdata.address_line_2,
  //         "address_city": formdata.address_city,
  //         "address_state": formdata.address_state,
  //         "address_zipcode": formdata.address_zipcode,
  //         "deliv_comments": formdata.comments,
  //         "amount_spent": amount_spent,
  //         "diet": formdata.diet,
  //         "restrictions": formdata.restrictions,
  //         "stripe_id": formdata.stripe_id,
  //         "preferredDelivDay": formdata.preferredDelivDay,
  //         "subscriptions": formdata.subscriptions,
  //         "coupon": formdata.percentOff || "Sub5",
  //         "pack": packPrefix,
  //         "credit": user_credit,
  //       };

  //       Meteor.call( 'updateSubscriber', Meteor.userId(), user, ( error, response ) => {
  //         if ( error ) {
  //           sAlert.error(error);
  //           console.log(error);
  //           Session.set('loading', false);
  //         // } else {
  //           // var orderToProcess = Session.get('orderId');
  //           // orderToProcess.readyBy = delivery_window.starts_at;
  //           // orderToProcess.deliv_day = delDay;
  //           // orderToProcess.coupon = Session.get('promo');
  //           // orderToProcess.deliv_id = last_purchase.id;
  //           // orderToProcess.trackingCode = last_purchase.tracking_code;

  //           // const orderToProcess = {
  //           //   _id: Se,
  //           //   packName: { type: String, optional: true },
  //           //   packPrice: { type: Number, optional: true },
  //           //   packDishes: { type: [ String ] },
  //           //   'packDishes.$': { type: String },
  //           //   packSnacks: { type: [ String ] },
  //           //   'packSnacks.$': { type: String },
  //           //   status: { type: String },
  //           //   coupon: { type: String, optional: true },
  //           //   deliveryWindow: { type: String, optional: true },
  //           //   destinationComments: { type: String, optional: true },
  //           //   deliveredAt: { type: String, optional: true },
  //           //   trackingCode: { type: String, optional: true },
  //           //   paidAt: { type: String, optional: true },
  //           //   readyBy: { type: String, optional: true },
  //           //   deliv_id: { type: String, optional: true },
  //           //   deliv_day: { type: String, optional: true },
  //           //   stripe_id: { type: String, optional: true },
  //           // };

  //           // const updatedOrder = updateOrder.call(orderToProcess, ( error, response ) => {
  //           //   if ( error ) {
  //           //     console.log(error);
  //           //   } else {
  //           //     analytics.track('Order Completed', {
  //           //       checkoutId: last_purchase.tracking_code,
  //           //       orderId: response.id,
  //           //       affiliation: 'Getfednyc.com',
  //           //       total: finalPrice,
  //           //       revenue: parseFloat(Session.get('salePrice').toFixed(2)),
  //           //       shipping: parseFloat(Session.get('delivFee').toFixed(2)),
  //           //       tax: parseFloat((Session.get('salePrice') * .08875).toFixed(2)),
  //           //       discount: Session.get('price') - Session.get('salePrice'),
  //           //       coupon: promo,
  //           //       currency: 'USD',
  //           //       products: [
  //           //         {
  //           //           name: orderToProcess.description,
  //           //           price: parseFloat(Session.get('price').toFixed(2)),
  //           //           quantity: 1,
  //           //         },
  //           //       ]
  //           //     });
  //           //   };
  //         //   });
  //         };
  //       });
  //       Session.set('loading', false);
  //       sAlert.success("You’re subscribed! Please check your email to confirm your settings and preferences.", { timeout: 'none', onClose: function() { FlowRouter.go('/menu'); }});
  //         // };
  //       // });
  //     };
  //   });
  // return false;
  // },
});