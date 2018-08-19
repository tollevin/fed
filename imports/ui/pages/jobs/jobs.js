import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './jobs.html';

// Components used inside the template

Template.Jobs.onCreated(function jobsOnCreated() {
  Session.set('cartOpen', false);
});
