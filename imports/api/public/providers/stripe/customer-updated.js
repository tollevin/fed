/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    const updatedCustomer = data;
    const user = Meteor.users.findOne({stripe_id: data.customer});
    user.stripeCustomer = newSubscription;
    const updatedSubscription = Meteor.call('updateUser', user._id, user);
    console.log(data.id + " subscription updated for " + user._id);
    return updatedSubscription;
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionUpdated.handler] ${exception} ID: ${data.customer}`);
  }
};

export const customerUpdated = (data) => handler(data);