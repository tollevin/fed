import { Template } from 'meteor/templating';

import moment from 'moment';

import { Items } from '/imports/api/items/items.js';

import { insertItem } from '/imports/api/items/methods.js';
import { insertMenu } from '/imports/api/menus/methods.js';

import { moment } from 'meteor/momentjs:moment';

import './new-item.html';

Template.NewItem.onCreated(function newItemOnCreated() {});

Template.NewItem.helpers({
  items: () => Items,

  insert: () => insertItem,
});

Template.NewItem.events({
  'click .sbmtItem'(event, templateInstance) {
    event.preventDefault();

    const formName = templateInstance.find('[name="name"]').value;
    const formCategory = templateInstance.find('[name="category"]').value;
    const formExp = templateInstance.find('[name="good_for_days"]').value;
    const ingredients = templateInstance.findAll('[name^="ingredients"]');
    const formIngredients = [];
    for (let i = ingredients.length - 1; i >= 0; i -= 1) {
      formIngredients[i] = ingredients[i].value;
    }
    const formNFSS = templateInstance.find('[name="nutrition_facts.servingSize"]').value;
    const formNFCal = templateInstance.find('[name="nutrition_facts.calories"]').value;
    const formNFTF = templateInstance.find('[name="nutrition_facts.totalFat"]').value;
    const formNFSF = templateInstance.find('[name="nutrition_facts.saturatedFat"]').value;
    const formNFTrF = templateInstance.find('[name="nutrition_facts.transFat"]').value;
    const formNFP = templateInstance.find('[name="nutrition_facts.protein"]').value;
    const formNFTC = templateInstance.find('[name="nutrition_facts.totalCarb"]').value;
    const formNFS = templateInstance.find('[name="nutrition_facts.sodium"]').value;
    const formNFC = templateInstance.find('[name="nutrition_facts.cholesterol"]').value;
    const formNFDF = templateInstance.find('[name="nutrition_facts.dietaryFiber"]').value;
    const formNFSu = templateInstance.find('[name="nutrition_facts.sugars"]').value;
    const formNFPDVvA = templateInstance.find('[name="nutrition_facts.PDV.vitaminA"]').value;
    const formNFPDVvC = templateInstance.find('[name="nutrition_facts.PDV.vitaminC"]').value;
    const formNFPDVC = templateInstance.find('[name="nutrition_facts.PDV.calcium"]').value;
    const formNFPDVI = templateInstance.find('[name="nutrition_facts.PDV.iron"]').value;
    const formADF = templateInstance.find('[name="attributes.dairyFree"]').checked;
    const formAGF = templateInstance.find('[name="attributes.glutenFree"]').checked;
    const formAP = templateInstance.find('[name="attributes.paleo"]').checked;
    const formAV = templateInstance.find('[name="attributes.vegan"]').checked;
    const formAVeg = templateInstance.find('[name="attributes.vegetarian"]').checked;
    const formPeanuts = templateInstance.find('[name="warnings.peanuts"]').checked;
    const formTreenuts = templateInstance.find('[name="warnings.treenuts"]').checked;
    const formSoy = templateInstance.find('[name="warnings.soy"]').checked;
    const formBeef = templateInstance.find('[name="warnings.beef"]').checked;
    const formChicken = templateInstance.find('[name="warnings.chicken"]').checked;
    const formFish = templateInstance.find('[name="warnings.fish"]').checked;
    const formShellfish = templateInstance.find('[name="warnings.shellfish"]').checked;
    const formMilk = templateInstance.find('[name="warnings.milk"]').checked;
    const formEggs = templateInstance.find('[name="warnings.eggs"]').checked;
    const formWheat = templateInstance.find('[name="warnings.wheat"]').checked;
    const formWeight = templateInstance.find('[name="weight"]').value;
    const formProducer = templateInstance.find('[name="producer"]').value;
    const formCost = templateInstance.find('[name="cost_per_unit"]').value;
    const formPrice = templateInstance.find('[name="price_per_unit"]').value;

    const item = {
      name: formName,
      category: formCategory,
      photo: templateInstance.find('[name="photo"]').value,
      description: templateInstance.find('[name="description"]').value,
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

  'click #newMenu'(event) {
    event.preventDefault();

    const nextReadyBy = moment().startOf('week').add(3, 'week').toDate();

    const menu = {
      name: 'test',
      ready_by: nextReadyBy,
    };

    insertMenu.call(menu, (err) => {
      if (err) {
        alert(err); // eslint-disable-line no-alert
      }
    });
  },
});
