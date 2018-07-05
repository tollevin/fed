import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

// Components used inside the template
import '/imports/ui/components/customers-toolbar/customers-toolbar.js';
import '/imports/ui/components/subscribers-view/subscribers-view.js';

// Template
import './subscribers-admin.html';
