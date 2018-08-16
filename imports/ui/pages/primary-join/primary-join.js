import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { signin } from '/imports/ui/lib/auth.js';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

// Zip Codes
import { zipZones } from '/imports/api/delivery/zipcodes.js';

import './primary-join.html';
import './primary-join.less';

Template.Primary_join.onCreated(function primaryJoinOnCreated() {
  Session.set('cartOpen', false);
});

Template.Primary_join.events({
  'submit form' (event, templateInstance) {
    event.preventDefault();

    const zip = templateInstance.find('[name="zipCode"]').value.toString();
    const zipInRange = zipZones[zip];
    var referrer = 'Primary';
    const dls = $('.delivery-location:checkbox:checked');
    var dl = '';

    for (var i = 0; i < dls.length; i++) {
      dl = dl.concat(dls[i].value);
    };

    if (zipInRange) {
      const user = {
        email: templateInstance.find('[name="emailAddress"]').value,
        password: templateInstance.find('[name="password"]').value,
        zipCode: zip,
        referrer: 'Primary',
        dl
      };

      Meteor.call('referUser', user, (error) => {
        if (error) { return $('#Errors').text(error.reason); }
        return signin(user, (signinError) => {
          if (signinError) { return $('#Errors').text(signinError); }
          return FlowRouter.go('/');
        });
      });
    } else {
      $('#Errors').text("Sorry. It looks like we don't deliver to your area yet."); // Validation error!
    }
  },
});
