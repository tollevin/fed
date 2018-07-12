/* eslint-disable consistent-return */

let modulo;

const handler = async (data, promise) => {
  try {
    modulo = promise;
    console.log(data);
  } catch (exception) {
    throw new Meteor.Error(`[invoicePaymentFailed.handler] ${exception}`);
  }
};

export const invoicePaymentFailed = data => handler(data);
