import { Meteor } from 'meteor/meteor';
import { chargeSucceeded } from './charge-succeeded.js';
import { invoiceCreated } from './invoice-created.js';
import { invoicePaymentFailed } from './invoice-paymentFailed.js';
import { invoicePaymentSucceeded } from './invoice-paymentSucceeded.js';
import { customerUpdated } from './customer-updated.js';
import { subscriptionCreated } from './subscription-created.js';
import { subscriptionUpdated } from './subscription-updated.js';
import { subscriptionDeleted } from './subscription-deleted.js';

const scenarios = {
  'charge.succeeded': chargeSucceeded,
  'invoice.created': invoiceCreated,
  'invoice.payment_failed': invoicePaymentFailed,
  'invoice.payment_succeeded': invoicePaymentSucceeded,
  'customer.updated': customerUpdated,
  // 'customer.subscription.trial_will_end': subscriptionTrialWillEnd,
  // 'customer.subscription.created': subscriptionCreated,
  // 'customer.subscription.updated': subscriptionUpdated,
  // 'customer.subscription.deleted': subscriptionDeleted,
  // 'customer.discount.created': discountCreated,
  // 'customer.discount.updated': discountUpdated,
  // 'customer.discount.deleted': discountDeleted,
};

const handler = ({ body }) => {
  try {
    const { type, data } = body;
    const scenario = scenarios[type];
    if (scenario) scenario(data.object);
  } catch (exception) {
    throw new Meteor.Error('500', `[stripeHandler.handler] ${exception}`);
  }
};

export const stripeHandler = (options) => {
  handler(options);
};
