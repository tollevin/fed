/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    const updatedCustomer = data;
    const user = Meteor.users.findOne({stripe_id: data.id});

    const account_balance = 0 - data.account_balance / 100;
    let previous_balance;
    
    if (user.credit) {
      previous_balance = user.credit;
    } else {
      previous_balance = 0;
    };

    user.credit = account_balance;

    const updatedUser = Meteor.call('updateUser', user._id, user);
    console.log("User " + user._id + " updated: Credit adjusted from $" + previous_balance + " to $" + user.credit);
  } catch (error) {
    throw new Meteor.Error(400, `[customerUpdated.handler] ${error} ID: ${data.id}`);
  }
};

export const customerUpdated = (data) => handler(data);