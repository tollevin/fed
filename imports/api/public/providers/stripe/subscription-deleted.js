/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    const newSubscription = data;
    const user = Meteor.users.findOne({stripe_id: data.customer});
    user.subscriptions = newSubscription;
    const deletedSubscription = Meteor.call('updateUser', user._id, user);
    console.log(data.id + " subscription deleted for " + user._id);
    return deletedSubscription;
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionDeleted.handler] ${exception} ID: ${data.customer}`);
  }
};

export const subscriptionDeleted = (data) => handler(data);