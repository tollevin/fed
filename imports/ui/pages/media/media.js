import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import '/imports/ui/components/footer/footer.js';

import './media.html';

// Components used inside the template


Template.Media.onCreated(function mediaOnCreated() {
	Session.set('cartOpen', false);
});

Template.Media.helpers({

});