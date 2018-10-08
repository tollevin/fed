import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import moment from 'moment';
import Mailchimp from 'mailchimp-api-v3';
// import { HTTP } from 'meteor/http';

// Collections
import { Promos } from '/imports/api/promos/promos.js';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

// Methods
import { processOrder } from '/imports/api/orders/methods.js';
import { usePromo } from '/imports/api/promos/methods.js';

// Components
import '/imports/ui/components/loader/loader.js';
import '/imports/ui/components/stripe-card-element/stripe-card-element.js';

// Template
import './mailing-list-signup.less';
import './mailing-list-signup.html';

Template.Mailing_List_Signup.onCreated(function mailingListSignupOnCreated() {
});

Template.Mailing_List_Signup.helpers({
});

Template.Mailing_List_Signup.events({
	'click .submit-email'(event, template) {
		event.preventDefault();
		
		mailchimp.post( '/lists/183601/members', {
		  "email_address": email,
		  "status": "subscribed",
		  "merge_fields": {
		      "FNAME": first_name,
		      "LNAME": last_name
		  }
		},
	},
});