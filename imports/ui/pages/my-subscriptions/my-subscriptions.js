import { Template } from 'meteor/templating';

import './my-subscriptions.html';

Template.My_Subscriptions.onCreated(function mySubscriptionsOnCreated() {
  this.autorun(() => {
    this.subscribe('thisUserData');
  });
});
