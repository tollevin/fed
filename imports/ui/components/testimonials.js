import { $ } from 'meteor/jquery';

import './testimonials.html';

// Template.Testimonials.onCreated(function testimonialsOnCreated() {
// });

Template.Testimonials.onRendered(function testimonialsOnRendered() {
	// $(function(){
 //    setInterval(function(){
	//   	var w = $('#testimonials').width();
	//   	console.log(w);
 //      $('.inner-carousel-wrapper').animate({left: w}, 800, 'linear')
 //         .appendTo('.inner-carousel-wrapper');
 //    }, 7000);
 //  });

  $('#carousel').slick({
    dots: false,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 6000,
    infinite: true,
	  speed: 600,
	  fade: true,
	  swipe: false,
	  slidesToShow: 1,
	  cssEase: 'linear',
  });
});

// Template.Testimonials.helpers({
// });

// Template.Testimonials.events({
// });