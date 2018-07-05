import { $ } from 'meteor/jquery';

import './lander-carousel.less';
import './lander-carousel.html';

Template.Lander_carousel.onDestroyed(function landerCarouselOnDestroyed() {
  $('#Lander-carousel').slick("unslick");
});

