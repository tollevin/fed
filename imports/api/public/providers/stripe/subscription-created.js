/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    const newSubscription = data;
    const user = Meteor.users.findOne({stripe_id: data.customer});
    user.subscriptions = newSubscription;
    const createdSubscription = Meteor.call('updateUser', user._id, user);
    console.log(data.id + " subscription created for " + user._id);
    return createdSubscription;
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionCreated.handler] ${exception} ID: ${data.customer}`);
  }
};

export const subscriptionCreated = (data) => handler(data);