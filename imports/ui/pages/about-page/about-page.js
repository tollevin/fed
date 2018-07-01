import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './about-page.less';
import './about-page.html';

Template.About_page.onCreated(function landingPageOnCreated() {
	Session.set('cartOpen', false);
});