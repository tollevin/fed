import { $ } from 'meteor/jquery';

import './testimonials.html';
import './testimonials.less';

Template.Testimonials.onRendered(function testimonialsOnRendered() {

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