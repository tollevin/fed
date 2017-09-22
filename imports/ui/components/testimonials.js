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
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 6000,
    infinite: true,
	  speed: 400,
	  slidesToShow: 3,
	  slidesToScroll: 1,
	  cssEase: 'linear',
	  responsive: [
	    {
	      breakpoint: 1000,
	      settings: {
	      	fade: true,
	      	speed: 500,
	      	slidesToShow: 1,
				  slidesToScroll: 1,
	      }
	    },
	    {
	      breakpoint: 600,
	      settings: {
	      	fade: false,
	      	speed: 500,
	      	slidesToShow: 1,
				  slidesToScroll: 1,
	      }
	    },
    ],
  });
});

// Template.Testimonials.helpers({
// });

// Template.Testimonials.events({
// });