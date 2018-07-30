import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './main-settings.less';
import './main-settings.html';

Template.Main_settings.helpers({
  subscribed: () => {
    const user = Meteor.user();
    return user && user.subscriptions && (user.subscriptions.status !== 'canceled'); // FIX!!!!
  },
});
