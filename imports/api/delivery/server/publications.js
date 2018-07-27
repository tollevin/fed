/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { moment } from 'meteor/momentjs:moment';
import { toNewYorkTimezone } from '/imports/ui/lib/time';

import { DeliveryWindows } from '../delivery-windows.js';
import { Menus } from '../../menus/menus.js';

Meteor.publish('DeliveryWindows.nextTwoWeeks', function nextFourDeliveryWindows(timestamp) {
  const now = moment.utc(timestamp).toDate();
  const endOfTwoWeeksFromNow = toNewYorkTimezone(new moment(timestamp)).endOf('week').add(2, 'week')
    .utc()
    .toDate();
  const mongoSelector = {
    $and: [
      {
        delivery_start_time: {
			  	$gte: now,
			  },
      },

		  {
        delivery_start_time: {
			  	$lte: endOfTwoWeeksFromNow,
			  },
		  },
    ],
  };

  return DeliveryWindows.find(mongoSelector);
});

Meteor.publish('DeliveryWindows.single', function singleDelivery(_id) {
  return DeliveryWindows.find({ _id });
});

Meteor.publish('DeliveryWindows.forMenu', function deliveryWindowsForMenu(menu_id) {
  const menu = Menus.findOne({ _id: menu_id });
  const dw_ids = menu.delivery_windows;
  return DeliveryWindows.find({ _id: { $in: dw_ids } });
});
