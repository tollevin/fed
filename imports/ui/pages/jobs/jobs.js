import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import '/imports/ui/components/footer/footer.js';

import './jobs.html';

// Components used inside the template


Template.Jobs.onCreated(function jobsOnCreated() {
	Session.set('cartOpen', false);
});

Template.Jobs.helpers({

});