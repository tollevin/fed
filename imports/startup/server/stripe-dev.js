import stripePackage from 'stripe';
const Stripe = stripePackage("sk_test_w4ls8BFupkyDG8WQ4F5fB7VZ" ); 

Meteor.methods({

  async processPayment( charge ) {
    check( charge, {
      amount: Number,
      currency: String,
      customer: Match.Maybe(String),
      capture: Match.Maybe(Boolean),
      source: Match.Maybe(String),
      description: String,
      receipt_email: String
    });

    try {
      let payment = await Stripe.charges.create( charge );
    
      return payment;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },
   
  async createCustomer( cust ) {
    check( cust, {
      description: String,
      source: String,
      account_balance: Number,
      email: Match.Maybe(String),
    });

    try {
      let customer = await Stripe.customers.create( cust );

      Meteor.users.update(Meteor.user(), {
        $set: {
          stripe_id: customer.id
        }
      });

      return customer;
    } catch(err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  createTrialCustomer( cust, email, password ) {
    check( cust, {
      description: String,
      source: String,
      account_balance: Number,
    });

    let handleCustomer = Meteor.wrapAsync( Stripe.customers.create, Stripe.customers ),
        customer =  handleCustomer( cust );

    const _id = Accounts.createUser({email: email, password: password});

    return customer;
  },

  async subscribeCustomer( sub ) {
    
    check( sub, {
      customer: String,
      plan: String,
      trial_period_days: Number,
      tax_percent: Number,
      coupon: String,
    });

    try {

      let subscription = await Stripe.subscriptions.create({
        customer: sub.customer,
        plan: sub.plan,
        trial_period_days: sub.trial_period_days,
        tax_percent: sub.tax_percent,
        coupon: sub.coupon
      });

      Meteor.users.update(Meteor.user(), {
        $set: {
          subscriptions: subscription
        }
      });

      return subscription;
    } catch(err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  //   // SyncedCron.add({
  //   //   name: 'Subscription processer for ' + Meteor.userId(),
  //   //   schedule: function(parser) {
  //   //     // parser is a later.parse object
  //   //     return parser.text('every Thursday');
  //   //   },
  //   //   job: function() {
  //   //     var numbersCrunched = CrushSomeNumbers();
  //   //     return numbersCrunched;
  //   //   }
  //   // });

  async retrieveCustomer( id ) {
    try {
      let customer = await Stripe.customers.retrieve( id );

      return customer;
    } catch(err) {
      console.log(err);
    }
  },

  async updateCustomer( id, args ) {
    check( args, {
      default_source: String
    });

    try {
      let source = await Stripe.customers.createSource(id, {source: args.default_source});
      let customer = await Stripe.customers.update( id, { default_source: source.id} );
      return customer;
    } catch(err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async updateSubscription( subscriptionId, args ) {
    try {
      let subscriptionUpdate = await Stripe.subscriptions.update( subscriptionId, { trial_end: args.trial_end, prorate: false } );
      return subscriptionUpdate;
    } catch(err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async cancelSubscription( customerId, subscriptionId ) {
    try {
      let cancelledSubscription = await Stripe.subscriptions.del( subscriptionId );
      return cancelledSubscription;
    } catch(err) {
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  async updateAllSubscriptions() {
    try {
      let allSubscriptionsObject = await Stripe.subscriptions.list();
      let allSubscriptionsList = allSubscriptionsObject.data;
      for (var i = allSubscriptionsList.length - 1; i >= 0; i--) {
        let customerExists = await Meteor.users.findOne({"stripe_id": allSubscriptionsList[i].customer});
        if (customerExists) {
          const data = {
            subscriptions: allSubscriptionsList[i],
          };

          const updatedCustomer = await Meteor.call('updateUser', customerExists._id, data);
          
          console.log(updatedCustomer.emails[0].address + " " + updatedCustomer.stripe_id)
        } else {
          console.log("XXX - " + allSubscriptionsList[i].customer + " IS A BIIIITCH!")
        }
      };
    } catch(err) {
      console.log(err.statusCode, err.message);
    }
  },

  async pauseAllSubscriptions() {
    try {
      let allSubscriptionsObject = await Stripe.subscriptions.list();
      let allSubscriptionsList = allSubscriptionsObject.data;
      var trial_end = moment("2017-06-01").unix();
      const data = {
        trial_end: trial_end,
      };
      var updatedTally = 0;
      for (var i = allSubscriptionsList.length - 1; i >= 0; i--) {
        let customerExists = await Meteor.users.findOne({"stripe_id": allSubscriptionsList[i].customer});
        if (customerExists) {
          if (allSubscriptionsList[i].status != ("active" || "trialing")) {
            console.log("Customer " + customerExists.emails[0].address + "is inactive")
          } else {
            const pausedSubscription = await Stripe.subscriptions.update(allSubscriptionsList[i].id, data);
            
            console.log("OK " + customerExists.emails[0].address + " " + pausedSubscription.id + " PAUSED");
            updatedTally += 1;
          };
        } else {
          const pausedSubscription = await Stripe.subscriptions.update(allSubscriptionsList[i].id, data);
          
          console.log("NOT IN SYSTEM - " + allSubscriptionsList[i].customer + " PAUSED");
          updatedTally += 1;
        };
      };
      return updatedTally;
    } catch(err) {
      console.log(err.statusCode, err.message);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },
});