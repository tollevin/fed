import { Meteor } from 'meteor/meteor';
import stripePackage from 'stripe';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

const Stripe = stripePackage('sk_live_KmzNeLrpctp1iT9Eo8n6qWoO');

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
      return await Stripe.charges.create(charge);
    } catch (err) {
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
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async createTrialCustomer(cust, email, password) {
    check(cust, {
      description: String,
      source: String,
      account_balance: Number,
    });

    check(email, String);
    check(password, String);

    try {
      const customer = await Stripe.customers.create(cust);

      Accounts.createUser({ email, password });

      return customer;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async retrieveCustomer(id) {
    check(id, String);

    try {
      return await Stripe.customers.retrieve(id);
    } catch (err) {
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
      return await Stripe.customers.update(args.id, { account_balance: credit });
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  // Sources

  async updateDefaultSource(args) {
    check(args, {
      id: String,
      default_source: String,
    });

    try {
      return await Stripe.customers.update(args.id, { default_source: args.default_source });
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
