import { $ } from 'meteor/jquery';

import './lander-carousel.html';

// Template.Menu_carousel.onCreated(function menuCarouselOnCreated() {
// });

Template.Lander_carousel.onRendered(function landerCarouselOnRendered() {
});

// Template.Lander_carousel.helpers({
// });

Template.Lander_carousel.events({
  // On before slide change
  'beforeChange #Lander-carousel' (event, slick, currentSlide, nextSlide) {
    console.log(nextSlide);
  },

  'destroy #Lander-carousel' (event, slick) {
    console.log(event);
  },
});

Template.Lander_carousel.onDestroyed(function landerCarouselOnDestroyed() {
  $('#Lander-carousel').slick("unslick");
});

