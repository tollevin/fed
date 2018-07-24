/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';

const handler = (data) => {
  try {
    const user = Meteor.users.findOne({ stripe_id: data.id });

    user.credit = 0 - data.account_balance / 100;

    Meteor.call('updateUser', user._id, user);
  } catch (error) {
    throw new Meteor.Error(400, `[customerUpdated.handler] ${error} ID: ${data.id}`);
  }
};

export const customerUpdated = data => handler(data);
