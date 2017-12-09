import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Orders } from '../../api/items/items.js';

import './support.html';
import '../components/footer.js';

// Components used inside the template


Template.Support_page.onCreated(function supportOnCreated() {
	Session.set('cartOpen', false);
});

Template.Support_page.helpers({

});