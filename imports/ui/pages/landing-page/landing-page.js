import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Autoform } from 'meteor/aldeed:autoform';

// Components
import '/imports/ui/components/footer/footer.js';
import '/imports/ui/components/testimonials/testimonials.js';
import '/imports/ui/components/menu-carousel/menu-carousel.js';
import '/imports/ui/components/lander-carousel/lander-carousel.js';

// Zip Codes
import { yesZips, MH, MH_20 } from '/imports/api/delivery/zipcodes.js';

import './landing-page.less';
import './landing-page.html';

Template.Landing_page.onCreated(function landingPageOnCreated() {
	Session.set('cartOpen', false);
  Session.set('userMenuOpen', false);
});

Template.Landing_page.onRendered(function landingPageOnRendered() {

  $(function(){
    $('#Lander-carousel').slick({
      dots: true,
      arrows: false,
      draggable: true,
      pauseOnHover: false,
      swipe: false,
      autoplay: true,
      autoplaySpeed: 15000,
      infinite: true,
      speed: 1500,
      fade: true,
      cssEase: 'linear',
    });
  });
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
    } else {
      return join;
    };
  },
});

Template.Landing_page.events({  
	'click #zipSubmit'(event, instance) {
    event.preventDefault();

    const zipInput = document.getElementById("zip").value.trim();

    if (yesZips.indexOf(zipInput) > -1 ) {
      Session.set('zipOk', true); 
      Session.set('zipNotYet', false);
    } else {
    	Session.set('zipNotYet', true);
    	Session.set('zipOk', false); 
    };
  },
});