import { Template } from 'meteor/templating';

import { Items } from '/imports/api/items/items.js';

import { insertItem } from '/imports/api/items/methods.js';
import { insertMenu } from '/imports/api/menus/methods.js';

import { moment } from 'meteor/momentjs:moment';

import './new-item.html';

Template.NewItem.onCreated(function newItemOnCreated() {
  const template = this;
  // this.subscribe('items');
});

Template.NewItem.helpers({
  items: () => Items,

  insert: () => insertItem,
});

Template.NewItem.events({
  'click .sbmtItem'(event, template) {
	  event.preventDefault();

	  const formName = template.find('[name="name"]').value;
	  const formCategory = template.find('[name="category"]').value;
	  const formDesc = template.find('[name="description"]').value;
	  const formExp = template.find('[name="good_for_days"]').value;
	  const ingredients = template.findAll('[name^="ingredients"]');
	  const formIngredients = [];
	  for (let i = ingredients.length - 1; i >= 0; i--) {
	  	formIngredients[i] = ingredients[i].value;
	  }
	  const formNFSS = template.find('[name="nutrition_facts.servingSize"]').value;
	  const formNFCal = template.find('[name="nutrition_facts.calories"]').value;
	  const formNFTF = template.find('[name="nutrition_facts.totalFat"]').value;
	  const formNFSF = template.find('[name="nutrition_facts.saturatedFat"]').value;
	  const formNFTrF = template.find('[name="nutrition_facts.transFat"]').value;
	  const formNFP = template.find('[name="nutrition_facts.protein"]').value;
	  const formNFTC = template.find('[name="nutrition_facts.totalCarb"]').value;
	  const formNFS = template.find('[name="nutrition_facts.sodium"]').value;
	  const formNFC = template.find('[name="nutrition_facts.cholesterol"]').value;
	  const formNFDF = template.find('[name="nutrition_facts.dietaryFiber"]').value;
	  const formNFSu = template.find('[name="nutrition_facts.sugars"]').value;
	  const formNFPDVvA = template.find('[name="nutrition_facts.PDV.vitaminA"]').value;
	  const formNFPDVvC = template.find('[name="nutrition_facts.PDV.vitaminC"]').value;
	  const formNFPDVC = template.find('[name="nutrition_facts.PDV.calcium"]').value;
	  const formNFPDVI = template.find('[name="nutrition_facts.PDV.iron"]').value;
	  const formADF = template.find('[name="attributes.dairyFree"]').checked;
	  const formAGF = template.find('[name="attributes.glutenFree"]').checked;
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
	  const formProducer = template.find('[name="producer"]').value;
	  const formCost = template.find('[name="cost_per_unit"]').value;
	  const formPrice = template.find('[name="price_per_unit"]').value;

	  const item = {
	    name: formName,
	    category: formCategory,
	    photo: template.find('[name="photo"]').value,
	    description: template.find('[name="description"]').value,
      ingredients: formIngredients,
      good_for_days: formExp,
      nutrition_facts: {
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
      	},
      },
      attributes: {
      	dairyFree: formADF,
      	glutenFree: formAGF,
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
      active: false,
      producer: formProducer,
      cost_per_unit: formCost,
      price_per_unit: formPrice,
	  };

	  insertItem.call(item, (err) => {
	    if (err) {
	      alert(err); // eslint-disable-line no-alert
	    }
	  });
  },

  'click #newMenu'(event, template) {
    event.preventDefault();

    const nextReadyBy = moment().startOf('week').add(3, 'week').toDate();

    const menu = {
      name: 'test',
      ready_by: nextReadyBy,
    };

    const menuId = insertMenu.call(menu, (err) => {
	    if (err) {
	      alert(err); // eslint-disable-line no-alert
	    }
	  });
  },
});
