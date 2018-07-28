/* eslint-disable consistent-return */

let modulo;

const handler = (data, promise) => {
  try {
    modulo = promise;
  } catch (exception) {
    modulo.reject(`[invoiceCreated.handler] ${exception}`);
  }
};

export const invoiceCreated = data => handler(data);
