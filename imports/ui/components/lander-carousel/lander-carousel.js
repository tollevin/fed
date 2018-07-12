import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './lander-carousel.less';
import './lander-carousel.html';

Template.Lander_carousel.onDestroyed(function landerCarouselOnDestroyed() {
  $('#Lander-carousel').slick('unslick');
});

Template.Lander_carousel.onRendered(function landingCarouselOnRendered() {
  $(function() {
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
