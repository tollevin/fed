import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Orders } from '/imports/api/items/items.js';

import '/imports/ui/components/footer/footer.js';

import './support.less';
import './support.html';
// Components used inside the template

Template.Support_page.onCreated(function supportOnCreated() {
	Session.set('cartOpen', false);
});

Template.Support_page.helpers({

});