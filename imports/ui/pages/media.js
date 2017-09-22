import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './media.html';
import '../components/footer.js';

// Components used inside the template


Template.Media.onCreated(function mediaOnCreated() {
	Session.set('cartOpen', false);
});

Template.Media.helpers({

});