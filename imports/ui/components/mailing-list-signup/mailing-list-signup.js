import { Template } from 'meteor/templating';

// Components
import '/imports/ui/components/loader/loader.js';
import '/imports/ui/components/stripe-card-element/stripe-card-element.js';

// Template

Template.Mailing_List_Signup.onCreated(function mailingListSignupOnCreated() {
});

Template.Mailing_List_Signup.helpers({
});

Template.Mailing_List_Signup.events({
  'click .submit-email'(event) {
    event.preventDefault();

    // This code can't run yet

    // mailchimp.post('/lists/183601/members', {
    //   email_address: email,
    //   status: 'subscribed',
    //   merge_fields: {
    //     FNAME: first_name,
    //     LNAME: last_name,
    //   },
    // });
  },
});
