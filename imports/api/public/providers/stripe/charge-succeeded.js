/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
    console.log(data);
  } catch (exception) {
    modulo.reject(`[chargeSucceeded.handler] ${exception}`);
  }
};

export const chargeSucceeded = data => handler(data);
