/* eslint-disable consistent-return */

let modulo;

const handler = async (data, promise) => {
  try {
    modulo = promise;
    console.log(data);

    // const customer = data.customer;
    // const user = Meteor.users.findOne({stripe_id: customer});

    // Email.send

    // Meteor.call('updateCustomer')
  } catch (exception) {
    throw new Meteor.Error(`[invoicePaymentFailed.handler] ${exception}`);
  }
};

export const invoicePaymentFailed = (data) => handler(data);