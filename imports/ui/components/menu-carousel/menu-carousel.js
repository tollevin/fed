import { $ } from 'meteor/jquery';

import './menu-carousel.html';

Template.Menu_carousel.onRendered(function menuCarouselOnRendered() {
  $(function(){
    $('#img-carousel img:gt(0)').hide();
    setInterval(function(){
      $('#img-carousel :first-child').fadeOut(800, 'linear')
         .next('img').fadeIn(800, 'linear')
         .end().appendTo('#img-carousel');
    }, 4800);
	});
});