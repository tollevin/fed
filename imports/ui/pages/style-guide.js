import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";

import "../components/footer.js";
import "./style-guide.html";

let card;

Template.Style_guide.onCreated(function styleGuideOnCreated() {
	Session.set("cartOpen", false);
});

Template.Style_guide.onRendered(function styleGuideOnRendered() {
	// BlazeLayout.reset(); // this will remove the current template.
	// BlazeLayout.render(...) // rerender

	$(function() {
		$("#Lander-carousel").slick({
			dots: true,
			arrows: false,
			draggable: true,
			pauseOnHover: false,
			swipe: false,
			autoplay: true,
			autoplaySpeed: 8000,
			infinite: true,
			speed: 1500,
			fade: true,
			cssEase: "linear"
		});
	});
});

Template.Style_guide.events({
	"click .code-reveal": function(event, template) {
		template
			.$("#" + event.currentTarget.id)
			.next()
			.toggle();
	}
});

Template.Style_guide.helpers({
	typographyHelpers: function() {
		return {
			h1: "<h1>Heading 1</h1>",
			h2: "<h2>Heading 2</h2>",
			h3: "<h3>Heading 3</h3>",
			h4: "<h4>Heading 4</h4>",
			p: "<p>Paragraph</p>"
		};
	},

	buttonHelpers: function() {
		return {
			cta: `<div class="CTA-button"><a href="/subscribe" class="btn-tertiary">
          <span class="CTA-text">Get Started</span>
        </a>
      </div>`,
			sbmtButton: `<div class="sbmt-button">
                      <button type="submit" class="btn-secondary">
                        Submit
                      </button>
                    </div>`
		};
	},
	carouselHelpers: function() {
		return {
			carousel: `<section id="landing">
                  <div id="lander">
                    {{> Lander_carousel}}
                  </div>
                </section>`
		};
	},
	menuPageHelpers: function() {
		return {
			menuCard: `<article class="menu-item">
      <a class="item-details" href="#">
        <div class="menu-item-img">
          <img src="/images/menu/2.jpg" alt="image goes here" />
        </div>
        <div class="menu-item-name">
          <h3>Menu Item Name</h3>
        </div>
      </a>
      <div class="menu-item-desc">
        <p>Description goes here</p>
      </div>
      <div class="menu-item-icons">
      </div>
      <div class="inputs">
        <div class="counter">
          <button class="remove-from-pack">-</button>
          <input type="number" value="0" readonly>
          <button class="add-to-pack">+</button>
        </div>
      </div>
    </article>`
		};
	},
	radioHelpers: function() {
		return {
			radio: `<div id="subscribe" class="">
                  <div id="wdye">
                  <div id="Diets">
                    <ul>
                      <li class="diet" id="Omnivore">
                        <input type="radio" name="diet" id="omnivore" value="Omnivore">
                        <label for="omnivore">
                          Omnivore
                        </label>
                      </li>
                      <li class="diet" id="Vegetarian">
                        <input type="radio" name="diet" id="vegetarian" value="Vegetarian">
                        <label for="vegetarian">
                          Vegetarian
                        </label>
                      </li>
                      <li class="diet" id="Vegan">
                        <input type="radio" name="diet" id="vegan" value="Vegan">
                        <label for="vegan">
                          Vegan
                        </label>
                      </li>
                      <li class="diet" id="Pescetarian">
                        <input type="radio" name="diet" id="pescetarian" value="Pescetarian">
                        <label for="pescetarian">
                          Pescetarian
                        </label>
                      </li>
                      <li class="diet" id="Paleo">
                        <input type="radio" name="diet" id="paleo" value="Paleo">
                        <label for="paleo">
                          Paleo
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>`
		};
	},
  formHelpers: function(){
    return{
      form: `            <div class="form-group">
                    <input type="text" name="customer.first_name" placeholder="First Name" required>
                    <input type="text" name="customer.last_name" placeholder="Last Name" required>
                  </div>`
    }
  }
});
