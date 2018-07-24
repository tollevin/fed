/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';

const handler = (data) => {
  try {
    const newSubscription = data;
    const user = Meteor.users.findOne({ stripe_id: data.customer });
    user.past_subscriptions = [newSubscription];
    const updatedSubscription = Meteor.call('updateUser', user._id, user);
    return updatedSubscription;
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionUpdated.handler] ${exception} ID: ${data.customer}`);
  }
};

export const subscriptionUpdated = data => handler(data);
