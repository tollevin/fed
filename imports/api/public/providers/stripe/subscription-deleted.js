/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    const newSubscription = data;
    const user = Meteor.users.findOne({stripe_id: data.customer});
    // if (user.past_subscriptions) {
    //   for (var i = user.past_subscriptions.length - 1; i >= 0; i--) {
    //     if (user.past_subscriptions[i].id === newSubscription.id) {
    //       user.past_subscriptions[i].status = 'canceled';
    //     } else {
    //       console.log('Stripe incongruence: Sub-' + data.id + ' does not exist for customer ' + user.first_name + ' ' + user.last_name + ' ' + data.customer);
    //     };
    //   };
    // } else {
      user.past_subscriptions = [ newSubscription ];
    // };
    
    const deletedSubscription = Meteor.call('updateUser', user._id, user);
    console.log(data.id + " stripe_subscription deleted for " + user._id);
    return deletedSubscription;
  } catch (exception) {
    throw new Meteor.Error(400, `[subscriptionDeleted.handler] ${exception} ID: ${data.customer}`);
  }
};

export const subscriptionDeleted = (data) => handler(data);