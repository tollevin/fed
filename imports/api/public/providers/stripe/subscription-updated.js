/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    const newSubscription = data;
    const user = Meteor.users.findOne({ stripe_id: data.customer });
    user.past_subscriptions = [newSubscription];
    const updatedSubscription = Meteor.call('updateUser', user._id, user);
    console.log(`${data.id} stripe_subscription updated for ${user._id}`);
    return updatedSubscription;
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionUpdated.handler] ${exception} ID: ${data.customer}`);
  }
};

export const subscriptionUpdated = data => handler(data);
