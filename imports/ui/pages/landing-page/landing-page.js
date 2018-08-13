import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

// Components
import '/imports/ui/components/testimonials/testimonials.js';
import '/imports/ui/components/lander-carousel/lander-carousel.js';

// Zip Codes
import { yesZips } from '/imports/api/delivery/zipcodes.js';

import './landing-page.less';
import './landing-page.html';

Template.Landing_page.onCreated(function landingPageOnCreated() {
  Session.set('cartOpen', false);
  Session.set('userMenuOpen', false);
});

Template.Landing_page.helpers({
  noPurchase() {
    return (Session.get('newUser'));
  },

  zipOk() {
    return Session.get('zipOk');
  },

  zipNotYet() {
    return Session.get('zipNotYet');
  },

  JoinMenu() {
    const menu = '/packs';
    const join = '/join';
    if (Meteor.userId()) {
      return menu;
    }
    return join;
  },
});

Template.Landing_page.events({
  'click #zipSubmit'(event) {
    event.preventDefault();

    const zipInput = document.getElementById('zip').value.trim();

    if (yesZips.indexOf(zipInput) > -1) {
      Session.set('zipOk', true);
      Session.set('zipNotYet', false);
    } else {
      Session.set('zipNotYet', true);
      Session.set('zipOk', false);
    }
  },
});
