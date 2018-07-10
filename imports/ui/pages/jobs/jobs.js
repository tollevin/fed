import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import '/imports/ui/components/footer/footer.js';

import './jobs.html';

// Components used inside the template

Template.Jobs.onCreated(function jobsOnCreated() {
	Session.set('cartOpen', false);
});
