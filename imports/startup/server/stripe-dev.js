import stripePackage from 'stripe';

const Stripe = stripePackage('sk_test_w4ls8BFupkyDG8WQ4F5fB7VZ');

Meteor.methods({

  // Charges

  async processPayment(charge) {
    check(charge, {
      amount: Number,
      currency: String,
      customer: Match.Maybe(String),
      capture: Match.Maybe(Boolean),
      source: Match.Maybe(String),
      description: String,
      receipt_email: String,
    });

    try {
      const payment = await Stripe.charges.create(charge);

      return payment;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  // Customers

  async createCustomer(cust) {
    check(cust, {
      description: String,
      source: String,
      account_balance: Number,
      email: Match.Maybe(String),
    });

    try {
      const customer = await Stripe.customers.create(cust);

      Meteor.users.update(Meteor.user(), {
        $set: {
          stripe_id: customer.id,
        },
      });

      return customer;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async createTrialCustomer(cust, email, password) {
    check(cust, {
      description: String,
      source: String,
      account_balance: Number,
    });

    try {
      const customer = await Stripe.customers.create(cust);

      const _id = Accounts.createUser({ email, password });

      return customer;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async retrieveCustomer(id) {
    try {
      const customer = await Stripe.customers.retrieve(id);

      return customer;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  // Credit

  async updateStripeCredit(args) {
    check(args, {
      id: String,
      account_balance: Number,
    });

    const credit = 0 - Math.round(args.account_balance * 100);

    try {
      const customer = await Stripe.customers.update(args.id, { account_balance: credit });
      return customer;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
      console.log('error: updateStripeCredit');
    }
  },

  // Sources

  async updateDefaultSource(args) {
    check(args, {
      id: String,
      default_source: String,
    });

    try {
      const customer = await Stripe.customers.update(args.id, { default_source: args.default_source });
      return customer;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async addPaymentSource(args) {
    check(args, {
      id: String,
      source: String,
    });

    try {
      const newSource = await Stripe.customers.createSource(args.id, { source: args.source });
      return newSource;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  // Subscriptions

  // async updateSubscription( args ) {
  //   try {
  //     console.log(args);
  //     let subscriptionUpdate = await Stripe.subscriptions.update( args.subscription_id, { trial_end: args.trial_end, prorate: false } );
  //     return subscriptionUpdate;
  //   } catch(error) {
  //     console.log(error);
  //     throw new Meteor.Error(err.statusCode, err.message);
  //   }
  // },

  // async cancelSubscription( customerId, subscriptionId ) {
  //   try {
  //     let cancelledSubscription = await Stripe.subscriptions.del( subscriptionId );
  //     return cancelledSubscription;
  //   } catch(err) {
  //     throw new Meteor.Error(err.statusCode, err.message);
  //   };
  // },

  // async updateAllSubscriptions() {
  //   try {
  //     let allSubscriptionsObject = await Stripe.subscriptions.list();
  //     let allSubscriptionsList = allSubscriptionsObject.data;
  //     for (var i = allSubscriptionsList.length - 1; i >= 0; i--) {
  //       let customerExists = await Meteor.users.findOne({"stripe_id": allSubscriptionsList[i].customer});
  //       if (customerExists) {
  //         const data = {
  //           subscriptions: allSubscriptionsList[i],
  //         };

  //         const updatedCustomer = await Meteor.call('updateUser', customerExists._id, data);

  //         console.log(updatedCustomer.emails[0].address + " " + updatedCustomer.stripe_id)
  //       } else {
  //         console.log("XXX - " + allSubscriptionsList[i].customer + " IS A BIIIITCH!")
  //       }
  //     };
  //   } catch(err) {
  //     console.log(err.statusCode, err.message);
  //   }
  // },

  // async pauseAllSubscriptions() {
  //   try {
  //     let allSubscriptionsObject = await Stripe.subscriptions.list();
  //     let allSubscriptionsList = allSubscriptionsObject.data;
  //     var trial_end = moment("2017-06-01").unix();
  //     const data = {
  //       trial_end: trial_end,
  //     };
  //     var updatedTally = 0;
  //     for (var i = allSubscriptionsList.length - 1; i >= 0; i--) {
  //       let customerExists = await Meteor.users.findOne({"stripe_id": allSubscriptionsList[i].customer});
  //       if (customerExists) {
  //         if (allSubscriptionsList[i].status != ("active" || "trialing")) {
  //           console.log("Customer " + customerExists.emails[0].address + "is inactive")
  //         } else {
  //           const pausedSubscription = await Stripe.subscriptions.update(allSubscriptionsList[i].id, data);

  //           console.log("OK " + customerExists.emails[0].address + " " + pausedSubscription.id + " PAUSED");
  //           updatedTally += 1;
  //         };
  //       };
  //     };
  //     console.log(updatedTally + " subscriptions paused");
  //     return updatedTally;
  //   } catch(err) {
  //     console.log(err.statusCode, err.message);
  //     throw new Meteor.Error(err.statusCode, err.message);
  //   };
  // },
});
