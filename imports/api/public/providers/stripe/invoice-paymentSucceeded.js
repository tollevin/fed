/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    console.log(data);

    // ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
    //   'id': last_purchase.tracking_code,// (Required) Transaction id (string).
    //   'affiliation': 'Getfednyc.com', // Affiliation (string).
    //   'revenue': parseFloat(template.order.subtotal.get().toFixed(2)), // Revenue (currency).
    //   'tax': parseFloat((template.order.subtotal.get() * .08875).toFixed(2)), // Tax (currency).
    //   'shipping': parseFloat(template.delivFee.get().toFixed(2)), // Shipping (currency).
    //   'coupon': template.order.coupon.get(), // Transaction coupon (string).
    // });
  } catch (exception) {
    modulo.reject(`[invoicePaymentSucceeded.handler] ${exception}`);
  }
};

export const invoicePaymentSucceeded = (data) => handler(data);