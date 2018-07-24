/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';

const handler = (data) => {
  try {
    const newSubscription = data;
    const user = Meteor.users.findOne({ stripe_id: data.customer });
    user.past_subscriptions = user.past_subscriptions || [];
    user.past_subscriptions.push(newSubscription);
    return Meteor.call('updateUser', user._id, user);
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionCreated.handler] ${exception} ID: ${data.customer}`);
  }
};

export const subscriptionCreated = data => handler(data);
