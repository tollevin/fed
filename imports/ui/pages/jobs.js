import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './jobs.html';
import '../components/footer.js';

// Components used inside the template


Template.Jobs.onCreated(function jobsOnCreated() {
	Session.set('cartOpen', false);
});

Template.Jobs.helpers({

});