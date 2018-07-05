import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '/imports/ui/components/footer/footer.js';

import './media.html';

// Components used inside the template
Template.Media.onCreated(function mediaOnCreated() {
	Session.set('cartOpen', false);
});
