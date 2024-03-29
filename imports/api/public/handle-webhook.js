import { Meteor } from 'meteor/meteor';
import { stripeHandler } from './providers/stripe/index.js';

const providers = {
  stripe: stripeHandler,
};

const handler = ({ provider, request }) => {
  try {
    const targetProvider = providers[provider];
    if (targetProvider) targetProvider({ body: request.body });
    return ('Webhook received!');
  } catch (exception) {
    throw new Meteor.Error(`[handleWebhook.handler] ${exception}`);
  }
};

export const handleWebhook = async (options) => {
  try {
    const webhook = await handler(options);
    return webhook;
  } catch (error) {
    throw new Meteor.Error(error);
  }
};
