import { HTTP } from 'meteor/http';
import moment from 'moment';

const store_id = "8736cd2e-ff66-4df4-b9ed-8a99d332ed01";
function rby() {
  if (moment().day() === 0 && moment().hour() < 12) {
    return moment().day(0).hour(17).minute(0).second(0).millisecond(0).toISOString();
  // } else if (moment().day() === 0 && moment().hour() < 24) {
  //   return moment().day(1).hour(17).minute(0).second(0).millisecond(0).toISOString();
  } else {
    return moment().day(7).hour(17).minute(0).second(0).millisecond(0).toISOString();
  };
};

Meteor.methods({

  createDelivEstimate (datum) {
    const zip = datum.customer_zipcode;
    const readyBy = rby();

    var result = HTTP.post("https://api-sandbox.deliv.co/v2/delivery_estimates", {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": "1060a1011a752254544e495341201c281319"
        },
        
        data: {
          "store_id": store_id,
          "customer_zipcode": zip,
          "ready_by": readyBy,
        }
    });

    // console.log(result.content)
    return result.data //<< JSON form (if api reports application/json as the content-type header
  },

  createDelivery (delivRequest) {
    const order_reference = delivRequest.order_reference;
    const customer = delivRequest.customer;
    const packages = delivRequest.packages;
    const window_id = delivRequest.delivery_window_id;
    const comments = delivRequest.destination_comments;
    const readyBy = rby();

    var result = HTTP.post("https://api-sandbox.deliv.co/v2/deliveries", {
      headers: {
          "Content-Type": "application/json",
          "Api-Key": "1060a1011a752254544e495341201c281319"
      },
      
      data:  {
        "store_id": store_id,
        "order_reference": order_reference,
        "customer": customer,
        "ready_by": readyBy,
        "packages": packages,
        "delivery_window_id": window_id,
        "customer_signature_type": "leave_at_door",
        "destination_comments": comments,
      },
    });

      // console.log(result.content)
    return result.data //<< JSON form (if api reports application/json as the content-type header
  },
});