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
});
