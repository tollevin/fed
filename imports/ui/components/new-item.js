import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Autoform } from 'meteor/aldeed:autoform';

import './new-item.html';
import { Items } from '../../api/items/items.js';

import {
	insertItem
} from '../../api/items/methods.js';

Template.NewItem.onCreated(function newItemOnCreated() {
  let template = this
  // this.subscribe('items');
});

Template.NewItem.helpers({
	items: ()=> {
		return Items
	},

	insert: ()=> {
		return insertItem
	}, 
});

Template.NewItem.events({
	'click .sbmtItem'(event, template) {
	  event.preventDefault();

	  const formName = template.find('[name="name"]').value;
	  const formCourse = template.find('[name="course"]').value;
	  const formDesc = template.find('[name="description"]').value;
	  const formExp = template.find('[name="goodFor_Days"]').value;
	  const ingredients = template.findAll('[name^="ingredients"]');
	  const formIngredients = [];
	  for (var i = ingredients.length - 1; i >= 0; i--) {
	  	formIngredients[i] = ingredients[i].value;
	  };
	  const formNFSS = template.find('[name="nutritionFacts.servingSize"]').value;
	  const formNFCal = template.find('[name="nutritionFacts.calories"]').value;
	  const formNFTF = template.find('[name="nutritionFacts.totalFat"]').value;
	  const formNFSF = template.find('[name="nutritionFacts.saturatedFat"]').value;
	  const formNFTrF = template.find('[name="nutritionFacts.transFat"]').value;
	  const formNFP = template.find('[name="nutritionFacts.protein"]').value;
	  const formNFTC = template.find('[name="nutritionFacts.totalCarb"]').value;
	  const formNFS = template.find('[name="nutritionFacts.sodium"]').value;
	  const formNFC = template.find('[name="nutritionFacts.cholesterol"]').value;
	  const formNFDF = template.find('[name="nutritionFacts.dietaryFiber"]').value;
	  const formNFSu = template.find('[name="nutritionFacts.sugars"]').value;
	  const formNFPDVvA = template.find('[name="nutritionFacts.PDV.vitaminA"]').value;
	  const formNFPDVvC = template.find('[name="nutritionFacts.PDV.vitaminC"]').value;
	  const formNFPDVC = template.find('[name="nutritionFacts.PDV.calcium"]').value;
	  const formNFPDVI = template.find('[name="nutritionFacts.PDV.iron"]').value;
	  const formADF = template.find('[name="attributes.dairyFree"]').checked;
	  const formAGF = template.find('[name="attributes.glutenFree"]').checked;
	  const formAHP = template.find('[name="attributes.highProtein"]').checked;
	  const formAP = template.find('[name="attributes.paleo"]').checked;
	  const formAV = template.find('[name="attributes.vegan"]').checked;
	  const formAVeg = template.find('[name="attributes.vegetarian"]').checked;
	  const formPeanuts = template.find('[name="warnings.peanuts"]').checked;
	  const formTreenuts = template.find('[name="warnings.treenuts"]').checked;
	  const formSoy = template.find('[name="warnings.soy"]').checked;
	  const formBeef = template.find('[name="warnings.beef"]').checked;
	  const formChicken = template.find('[name="warnings.chicken"]').checked;
	  const formFish = template.find('[name="warnings.fish"]').checked;
	  const formShellfish = template.find('[name="warnings.shellfish"]').checked;
	  const formMilk = template.find('[name="warnings.milk"]').checked;
	  const formEggs = template.find('[name="warnings.eggs"]').checked;
	  const formWheat = template.find('[name="warnings.wheat"]').checked;
	  const formWeight = template.find('[name="weight"]').value;

	  const item = {
	    name: formName,
	    course: formCourse,
	    photo: template.find('[name="photo"]').value,
	    description: template.find('[name="description"]').value,
	    packs: {
        omnivorePack: false,
        vegetarianPack: false,
      },
      ingredients: formIngredients,
      goodFor_Days: formExp,
      nutritionFacts: {
      	servingSize: formNFSS,
      	calories: formNFCal,
      	totalFat: formNFTF,
      	saturatedFat: formNFSF,
      	transFat: formNFTrF,
      	protein: formNFP,
      	totalCarb: formNFTC,
      	sodium: formNFS,
      	cholesterol: formNFC,
      	dietaryFiber: formNFDF,
      	sugars: formNFSu,
      	PDV: {
      		vitaminA: formNFPDVvA,
      		vitaminC: formNFPDVvC,
      		calcium: formNFPDVC,
      		iron: formNFPDVI,
      	}
      },
      attributes: {
      	dairyFree: formADF,
      	glutenFree: formAGF,
      	highProtein: formAHP,
      	paleo: formAP,
      	vegan: formAV,
      	vegetarian: formAVeg,
      },
      warnings: {
      	peanuts: formPeanuts,
      	treenuts: formTreenuts,
      	soy: formSoy,
      	beef: formBeef,
      	chicken: formChicken,
      	fish: formFish,
      	shellfish: formShellfish,
      	milk: formMilk,
      	eggs: formEggs,
      	wheat: formWheat,
      },
      weight: formWeight,
	  };

	  insertItem.call(item, (err) => {
	    if (err) {
	      alert(err); // eslint-disable-line no-alert
	    }
	  });
	},
});