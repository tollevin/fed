import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { moment } from 'meteor/momentjs:moment';

const storeId = '47db9398-af1c-4c77-9d66-8fd081661243';
function rby() {
  if (moment().day() === 0 && moment().hour() < 12) {
    return moment().day(0).hour(17).minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();
  // } else if (moment().day() === 0 && moment().hour() < 24) {
  //   return moment().day(1).hour(17).minute(0).second(0).millisecond(0).toISOString();
  }
  return moment().day(7).hour(17).minute(0)
    .second(0)
    .millisecond(0)
    .toISOString();
}

Meteor.methods({
  createDelivEstimate (datum) {
    const zip = datum.customer_zipcode;
    const readyBy = rby();

    const result = HTTP.post('https://api.deliv.co/v2/delivery_estimates', {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': '2cf283793bbd969db260592eafbf594b9bbe',
      },

      data: {
        store_id: storeId,
        customer_zipcode: zip,
        ready_by: readyBy,
      },
    });

    // console.log(result.content)
    return result.data; // << JSON form (if api reports application/json as the content-type header
  },

  createDelivery (delivRequest) {
    const {
      order_reference: orderReference,
      customer,
      packages,
      delivery_window_id: windowId,
      destination_comments: comments,
    } = delivRequest;

    const readyBy = rby();

    const result = HTTP.post('https://api.deliv.co/v2/deliveries', {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': '2cf283793bbd969db260592eafbf594b9bbe',
      },

      data: {
        store_id: storeId,
        order_reference: orderReference,
        customer,
        ready_by: readyBy,
        packages,
        delivery_window_id: windowId,
        customer_signature_type: 'leave_at_door',
        destination_comments: comments,
      },
    });

    // console.log(result.content)
    return result.data; // << JSON form (if api reports application/json as the content-type header
  },
});
