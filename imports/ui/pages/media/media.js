import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import '/imports/ui/components/footer/footer.js';

import './media.html';

// Components used inside the template
Template.Media.onCreated(function mediaOnCreated() {
	Session.set('cartOpen', false);
});
