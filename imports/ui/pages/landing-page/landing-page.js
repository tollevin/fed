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

import './landing-page.html';


Template.Landing_page.onCreated(function landingPageOnCreated() {
	Session.set('cartOpen', false);
  Session.set('userMenuOpen', false);
});

Template.Landing_page.onRendered(function landingPageOnRendered() {
  // BlazeLayout.reset(); // this will remove the current template.
  // BlazeLayout.render(...) // rerender

  // if (subscribed) FlowRouter.go('/home');

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
  // 'click #MainCTA' (event) {
  //   event.preventDefault();

  //   ga('ec:setAction', 'purchase', { // Transaction details are provided in an actionFieldObject.
  //     'id': 'test',
  //     'affiliation': 'Getfednyc.com',
  //     'revenue': '85.00',
  //     'tax': '5.00',
  //     'shipping': '13.00',
  //     'coupon': 'TestCoupon'
  //   });

  //   console.log('sent');
  // },
  
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