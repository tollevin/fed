import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Template
import './delivery-day-toggle.html';

Template.Delivery_day_toggle.helpers({
  checked: () => {
    const user = Meteor.user();
    return user && (user.preferredDelivDay === 'monday');
  },
});

const swapPreferredDeliveryDate = (user) => {
  const prevDeliveryDay = user.preferredDelivDay;
  const preferredDelivDay = (prevDeliveryDay === 'sunday') ? 'monday' : 'sunday';

  Meteor.call('updateUser', user._id, { ...user, preferredDelivDay });
  return preferredDelivDay;
};

Template.Delivery_day_toggle.events({
  'click .switch, touchstart .switch'(event) {
    event.preventDefault();
    const user = Meteor.user();
    const preferredDelivDay = swapPreferredDeliveryDate(user);
    // toggleDeliveryDay.call({ day: preferredDelivDay });

    return Meteor.call('toggleDeliveryDay', { day: preferredDelivDay });
  },
});
