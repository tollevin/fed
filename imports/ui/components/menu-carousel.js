import { $ } from 'meteor/jquery';

import './menu-carousel.html';

// Template.Menu_carousel.onCreated(function menuCarouselOnCreated() {
// });

Template.Menu_carousel.onRendered(function menuCarouselOnRendered() {
  $(function(){
    $('#img-carousel img:gt(0)').hide();
    setInterval(function(){
      $('#img-carousel :first-child').fadeOut(800, 'linear')
         .next('img').fadeIn(800, 'linear')
         .end().appendTo('#img-carousel');
    }, 4800);
	});


  // $('#img-carousel').slick({
  //   dots: false,
  //   arrows: false,
  //   draggable: false,
  //   pauseOnHover: false,
  //   swipe: false,
  //   autoplay: true,
  //   autoplaySpeed: 6000,
  //   infinite: true,
	 //  speed: 400,
	 //  fade: true,
	 //  cssEase: 'linear',
  // });
});

// Template.Menu_carousel.helpers({
// });

// Template.Menu_carousel.events({
// });