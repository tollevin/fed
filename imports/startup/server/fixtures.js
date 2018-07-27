import { Meteor } from 'meteor/meteor';
import { Items } from '/imports/api/items/items.js';
import { Menus } from '/imports/api/menus/menus.js';
import { DeliveryWindows } from '/imports/api/delivery/delivery-windows.js';
import { createDeliveryWindows } from '/imports/api/delivery/methods.js';

import { moment } from 'meteor/momentjs:moment';

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  if (Items.find().count() === 0) {
    console.log('fixturing...');
    const subscribers = Meteor.users.find({ 'subscriptions.status': { $nin: ['canceled', null] } }).fetch();
    for (let i = subscribers.length - 1; i >= 0; i--) {
      const oldSub = subscribers[i].subscriptions;
      if (!oldSub.plan) console.log(subscribers[i]._id);
      if (oldSub.plan) {
        const oldPlan = Number(oldSub.plan.id.split('PP')[0]);

        let oldDiscount;
        oldSub.discount ? oldDiscount = Number(oldSub.discount.coupon.id.split('Sub')[1]) : oldDiscount = 0;

        const oldCreated = new Date(oldSub.created * 1000);

        const newPlanItemName = `${subscribers[i].diet} ${oldPlan}-Pack`;
        let subItem = Items.findOne({ name: newPlanItemName });
        if (!subItem) {
          subItem = { _id: 'FIX' };
          console.log(2, newPlanItemName, subscribers[i]._id);
        }
        const newSub = [{
          item_id: subItem._id,
          created_at: oldCreated,
          canceled_at: null,
          percent_off: oldDiscount,
          quantity: 1,
          frequency: 7,
          tax_percent: 8.875,
          _id: null,
          status: 'active',
          item_name: newPlanItemName,
          subscribed_at: oldCreated,
        }];

        Meteor.users.update({ _id: subscribers[i]._id }, {
          $set: {
            past_subscriptions: oldSub,
            subscriptions: newSub,
          },
        });
      }
    }

    // if (Items.find().count() === 0) {
    console.log('Creating fixtures...');

    // When using API 1.0 items, manually change "course":"Dish" to "category":"Meal","subcategory":""

    const platesA = [
      {
        name: 'Roast Beef w/ Asparagus Sauce',
        category: 'Meal',
        subcategory: 'Beef',
        description: 'mushrooms, jicama, plum tomatoes, fresh herbs',
        createdAt: '2017-05-26T06:51:34.773Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['beef rounds', 'mushrooms', 'jicama', 'plum tomatoes', 'onion', 'asparagus', 'shallots', 'cayenne pepper', 'extra virgin olive oil', 'parsley', 'garlic', 'rosemary', 'lemon', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: true, chicken: false, fish: false, shellfish: false, eggs: false, milk: false, wheat: false,
        },
        photo: '/images/menu/86.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          servingSize: '390',
          calories: '300',
          totalFat: '11',
          saturatedFat: '2.5',
          transFat: '0',
          protein: '29',
          totalCarb: '25',
          sodium: '230',
          cholesterol: '65',
          dietaryFiber: '8',
          sugars: '9',
          PDV: {
            vitaminA: '60', vitaminC: '60', calcium: '10', iron: '25',
          },
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: true, paleo: true, vegan: false, vegetarian: false,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        weight: 3,
        active: false,
        id: 'B-013',
      },
      {
        name: 'Orange & Ginger Salmon',
        id: 'F-009',
        category: 'Meal',
        subcategory: 'Fish',
        description: 'eggplant, peppers, mixed potatoes',
        createdAt: '2017-04-09T15:11:38.294Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['atlantic salmon', 'eggplant', 'potatoes', 'red peppers', 'onions', 'lemon', 'parsley', 'garlic', 'extra virgin olive oil', 'ground ginger', 'oranges', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: true, shellfish: false, eggs: false, milk: false, wheat: false,
        },
        photo: '/images/menu/189.jpg',
        goodFor_Days: 3,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          servingSize: '390',
          calories: '450',
          totalFat: '18',
          saturatedFat: '3',
          transFat: '0',
          protein: '40',
          totalCarb: '30',
          sodium: '250',
          cholesterol: '105',
          dietaryFiber: '5',
          sugars: '6',
          PDV: {
            vitaminA: '45', vitaminC: '150', calcium: '6', iron: '15',
          },
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: true, paleo: false, vegan: false, vegetarian: false,
        },
        active: false,
        weight: 3,
      },
      {
        name: 'Chicken w/ Pineapple Sauce',
        id: 'CH-011',
        category: 'Meal',
        subcategory: 'Chicken',
        description: 'jicama, red peppers, lotus root',
        createdAt: '2017-05-07T05:36:37.994Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['chicken breast', 'jicama', 'red peppers', 'lotus root', 'onions', 'shallots', 'pineapple', 'extra virgin olive oil', 'lemon', 'cilantro', 'garlic', 'black pepper', 'limes', 'thyme', 'chili pepper', 'salt'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: true, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/81.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          servingSize: '376',
          calories: '370',
          totalFat: '15',
          saturatedFat: '2.5',
          transFat: '0',
          protein: '26',
          totalCarb: '34',
          sodium: '350',
          cholesterol: '70',
          dietaryFiber: '9',
          sugars: '10',
          PDV: {
            vitaminA: '50', vitaminC: '220', calcium: '8', iron: '15',
          },
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: true, paleo: true, vegan: false, vegetarian: false,
        },
        active: false,
        weight: 3,
      },
      {
        name: 'Hot Pepper Chicken',
        category: 'Meal',
        subcategory: 'Chicken',
        description: 'red peppers, squash, brussels sprouts, 4 pepper sauce',
        createdAt: '2017-12-28T17:17:35.654Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Details Coming Soon'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: true, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/168.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          PDV: {
            vitaminA: '230', vitaminC: '290', calcium: '8', iron: '15',
          },
          servingSize: '410',
          calories: '280',
          totalFat: '9',
          saturatedFat: '1',
          transFat: '0',
          cholesterol: '55',
          sodium: '140',
          totalCarb: '23',
          dietaryFiber: '6',
          sugars: '8',
          protein: '27',
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: false, vegetarian: false,
        },
        weight: 3,
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: false,
      },
      {
        name: 'Tofu Tomatillo',
        id: 'SY-014',
        category: 'Meal',
        subcategory: 'Soy',
        description: 'parsnips, red peppers, zucchini, tomatillo salsa',
        createdAt: '2017-05-07T05:27:21.671Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['firm tofu (Soy)', 'parsnips', 'red peppers', 'zucchini', 'tomatillos', 'onion', 'poblano peppers', 'serrano peppers', 'avocados', 'lime juice', 'coriander powder', 'extra virgin olive oil', 'cilantro', 'parsley', 'garlic', 'corn oil', 'chipotle pepper', 'cumin', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: false, soy: true, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/80.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false, veganPack: false },
        nutritionFacts: {
          servingSize: '410',
          calories: '310',
          totalFat: '15',
          saturatedFat: '2',
          transFat: '0',
          protein: '15',
          totalCarb: '34',
          sodium: '75',
          cholesterol: '0',
          dietaryFiber: '10',
          sugars: '11',
          PDV: {
            vitaminA: '110', vitaminC: '210', calcium: '15', iron: '25',
          },
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: false, vegan: true, vegetarian: true,
        },
        active: false,
        weight: 3,
      },
      {
        name: 'Asparagus Quiche',
        id: 'VT-002',
        category: 'Meal',
        subcategory: 'Vegetable',
        description: 'sweet potato, zucchini, broccoli, artichokes',
        createdAt: '2017-04-30T15:36:10.716Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['sweet potato', 'asparagus', 'zucchini', 'broccoli', 'heirloom tomatoes', 'artichokes', 'wheat flour', 'egg', 'oats', 'shallots', 'onion', 'brie (Milk)', 'lemon', 'parsley', 'garlic', 'extra virgin olive oil', 'thyme', 'rosemary', 'corn oil', 'sunflower oil', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: true, eggs: true, wheat: false,
        },
        photo: '/images/menu/76.jpg',
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          PDV: {
            vitaminA: '290', vitaminC: '130', calcium: '15', iron: '20',
          },
          servingSize: '410',
          calories: '400',
          totalFat: '12',
          saturatedFat: '3',
          transFat: '0',
          cholesterol: '75',
          sodium: '280',
          totalCarb: '62',
          dietaryFiber: '11',
          sugars: '11',
          protein: '16',
        },
        attributes: {
          dairyFree: false, glutenFree: false, highProtein: false, paleo: false, vegan: false, vegetarian: true,
        },
        active: false,
        weight: 2,
      },
      {
        name: 'Broccoli Steak',
        id: 'VT-004',
        category: 'Meal',
        subcategory: 'Vegetable',
        description: 'braised kale, beet, jalapeno, amaranth seeds',
        createdAt: '2017-04-30T15:34:57.637Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['broccoli', 'red beets', 'kale', 'shallots', 'amaranth seeds', 'honey', 'lemon juice', 'balsamic vinegar', 'jalapeno peppers', 'extra virgin olive oil', 'garlic', 'thyme', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/25.jpg',
        packs: { omnivorePack: false, vegetarianPack: false, veganPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        active: false,
        weight: 3,
      },
      {
        name: 'Lentil Pasta w/ Broccoli Ragout',
        id: 'G-002',
        category: 'Meal',
        subcategory: 'Grain',
        description: 'eggplant, chickpeas, carrots, parmesan',
        createdAt: '2017-09-17T18:36:09.212Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['lentil pasta (green lentil flour)', 'broccoli', 'eggplant', 'carrots', 'chickpeas', 'onion', 'peeled tomatoes', 'extra virgin olive oil', 'basil', 'parsley', 'parmesan (MILK)', 'oregano', 'sumac', 'garlic', 'black pepper', 'cayenne pepper', 'salt'],
        photo: '/images/menu/144.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false, veganPack: false },
        nutritionFacts: {
          PDV: {
            vitaminA: '270', vitaminC: '120', calcium: '10', iron: '20',
          },
          servingSize: '309',
          calories: '620',
          totalFat: '13',
          saturatedFat: '1.5',
          transFat: '0',
          cholesterol: '0',
          sodium: '105',
          totalCarb: '101',
          dietaryFiber: '16',
          sugars: '13',
          protein: '34',
        },
        attributes: {
          dairyFree: false, glutenFree: true, highProtein: false, paleo: true, vegan: false, vegetarian: true,
        },
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: true, wheat: false, eggs: false,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: false,
        weight: 2,
      },
      {
        name: 'Quinoa & Asparagus',
        id: 'G-013',
        category: 'Meal',
        subcategory: 'Grain',
        description: 'heirloom tomatoes, chickpeas, fresh herbs',
        createdAt: '2017-06-25T15:27:35.622Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['quinoa', 'asparagus', 'heirloom tomatoes', 'sev (chickpeas)', 'celery', 'shallots', 'onion', 'black pepper', 'lemon', 'parsley', 'extra virgin olive oil', 'tarragon', 'salt'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/106.jpg',
        goodFor_Days: 3,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          PDV: {
            vitaminA: '30', vitaminC: '50', calcium: '10', iron: '30',
          },
          servingSize: '402',
          calories: '320',
          totalFat: '6',
          saturatedFat: '1',
          transFat: '0',
          cholesterol: '0',
          sodium: '160',
          totalCarb: '56',
          dietaryFiber: '13',
          sugars: '8',
          protein: '14',
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: false,
        weight: 2,
      },
      {
        name: 'Mushroom & White Bean Soup',
        id: 'SP-018',
        category: 'Meal',
        subcategory: 'Soup',
        description: 'sweet potato, kale, carrots, celery',
        createdAt: '2017-10-22T16:47:15.502Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['sweet potato', 'kale', 'white beans', 'carrots', 'celery', 'mushrooms', 'onion', 'tomato', 'lemon juice', 'cilantro', 'parsley', 'garlic', 'ginger', 'rosemary', 'extra virgin olive oil', 'thyme', 'black pepper', 'salt'],
        photo: '/images/menu/156.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false, veganPack: false },
        nutritionFacts: {
          PDV: {
            vitaminA: '700', vitaminC: '110', calcium: '20', iron: '30',
          },
          servingSize: '400',
          calories: '270',
          totalFat: '2.5',
          saturatedFat: '0',
          transFat: '0',
          cholesterol: '0',
          sodium: '170',
          totalCarb: '55',
          dietaryFiber: '13',
          sugars: '16',
          protein: '13',
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: false,
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        weight: 1,
      },
      {
        name: 'Chipotle Butternut Squash Soup',
        category: 'Meal',
        subcategory: 'Soup',
        description: 'Details coming soon...',
        createdAt: '2018-05-06T06:47:24.626Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Details coming soon...'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/188.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        weight: 3,
        ordersThisWeek: 0,
        ordersTotal: 0,
      },
      {
        name: 'Blueberry & Hemp Slaw',
        id: 'SD-005',
        category: 'Meal',
        subcategory: 'Salad',
        description: 'purple cabbage, radish, pickled ginger, cashews',
        createdAt: '2017-07-23T14:50:17.567Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['cabbage', 'quinoa', 'blueberries', 'red radishes', 'hemp seeds', 'raspberries', 'lemon juice', 'cashews', 'extra virgin olive oil', 'mustard', 'ginger', 'cayenne pepper', 'coriander powder', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: true, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/121.jpg',
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          PDV: {
            vitaminA: '45', vitaminC: '110', calcium: '10', iron: '20',
          },
          servingSize: '320',
          calories: '280',
          totalFat: '13',
          saturatedFat: '2',
          transFat: '0',
          cholesterol: '0',
          sodium: '230',
          totalCarb: '35',
          dietaryFiber: '9',
          sugars: '11',
          protein: '11',
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: false,
        weight: 1.5,
      },
      {
        name: 'Baby Kale w/ Grapes',
        id: 'SD-003',
        category: 'Meal',
        subcategory: 'Salad',
        description: 'carrots, quinoa, peanut dressing',
        createdAt: '2017-04-09T15:17:41.207Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['baby kale', 'carrots', 'quinoa', 'grapes', 'parsley', 'radishes', 'lemon juice', 'red onion', 'peanut butter (PEANUTS)', 'corn oil', 'extra virgin olive oil', 'mustard', 'garlic powder', 'kaffir leaf', 'cayenne pepper', 'salt', 'black pepper'],
        warnings: {
          peanuts: true, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/21.jpg',
        goodFor_Days: 3,
        packs: { omnivorePack: false, vegetarianPack: false, veganPack: false },
        nutritionFacts: {
          servingSize: '252',
          calories: '290',
          totalFat: '17',
          saturatedFat: '2.5',
          transFat: '0',
          protein: '10',
          totalCarb: '30',
          sodium: '330',
          cholesterol: '0',
          dietaryFiber: '7',
          sugars: '10',
          PDV: {
            vitaminA: '290', vitaminC: '210', calcium: '20', iron: '15',
          },
        },
        attributes: {
          dairyFree: false, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        active: false,
        weight: 1.1,
      },
    ];

    const platesB = [
      {
        _id: 'i98NZRhyL7THGyAHZ',
        name: 'Chicken w/ Babaganoush',
        category: 'Meal',
        subcategory: 'Chicken',
        description: 'Details coming soon...',
        createdAt: '2018-05-06T06:41:11.527Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Details coming soon...'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: true, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/coming-soon.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: false, vegetarian: false,
        },
        weight: 3,
        ordersThisWeek: 0,
        ordersTotal: 0,
      },
      {
        _id: '7TKLdiWkJPTfjRwPf',
        name: 'Rhubarb & Ginger Tempeh',
        id: 'SY-008',
        category: 'Meal',
        subcategory: 'Soy',
        description: 'zucchini, jicama, peppers, fresh herbs',
        createdAt: '2017-05-26T07:03:26.185Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['tempeh (Soy)', 'sweet potato', 'peppers', 'zucchini', 'shallots', 'rhubarb', 'beetroot', 'lemon', 'cilantro', 'parsley', 'garlic', 'ground ginger', 'rosemary', null, 'extra virgin olive oil', null, 'corn oil', 'sumac', 'thyme', 'salt', 'black pepper'],
        warnings: {
          peanuts: false, treenuts: false, soy: true, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/88.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          servingSize: '420',
          calories: '350',
          totalFat: '14',
          saturatedFat: '3.5',
          transFat: '0',
          protein: '21',
          totalCarb: '41',
          sodium: '210',
          cholesterol: '0',
          dietaryFiber: '11',
          sugars: '13',
          PDV: {
            vitaminA: '310', vitaminC: '280', calcium: '20', iron: '25',
          },
        },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: true, paleo: false, vegan: true, vegetarian: true,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        weight: 3,
        active: false,
      },
      {
        _id: 'rFAf2qPBP42eJc7Ym',
        name: 'Coriander Carrot Steak',
        category: 'Meal',
        subcategory: 'Vegetable',
        description: 'Details coming soon...',
        createdAt: '2018-05-06T06:41:44.846Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Details coming soon...'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/coming-soon.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: true, vegan: true, vegetarian: true,
        },
        weight: 3,
        ordersThisWeek: 0,
        ordersTotal: 0,
      },
      {
        _id: 'ZGTMLjNE5hrk7kAHZ',
        name: 'Peas & Quinoa',
        id: 'G-014',
        category: 'Meal',
        subcategory: 'Grain',
        description: 'halloumi, zucchini, heirloom tomato, tarragon',
        createdAt: '2017-08-13T16:07:55.637Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Details Coming Soon!'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: true, eggs: false, wheat: false,
        },
        photo: '/images/menu/128.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: false, glutenFree: true, highProtein: true, paleo: false, vegan: false, vegetarian: true,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: false,
        weight: 2,
      },
      {
        _id: 'iGc28tfWwDN6Equcb',
        name: 'Spinach & Roasted Chickpeas',
        id: 'SD-015',
        category: 'Meal',
        subcategory: 'Salad',
        description: 'pear, lavender poppy seed goat cheese, dried cherry, sunflower seeds, raspberry dressing',
        createdAt: '2017-01-27T07:50:00.574Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Chickpeas', 'Spinach', 'Pears', 'Raspberries', 'Dried Cranberries', 'Lemon Juice', 'Goat Cheese (MILK)', 'Poppy Seeds', 'Sunflower Seeds', 'Extra Virgin Olive Oil', 'Lavender', 'Maple Syrup', 'Chipotle Pepper', 'Salt'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: true, eggs: false, wheat: false,
        },
        photo: '/images/menu/37.jpg',
        goodFor_Days: 2,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: {
          servingSize: '300',
          calories: '290',
          totalFat: '10',
          saturatedFat: '2',
          transFat: '0',
          protein: '11',
          totalCarb: '45',
          sodium: '390',
          cholesterol: '<5',
          dietaryFiber: '12',
          sugars: '11',
          PDV: {
            vitaminA: '140', vitaminC: '60', calcium: '20', iron: '25',
          },
        },
        attributes: {
          dairyFree: false, glutenFree: true, highProtein: false, paleo: true, vegan: false, vegetarian: true,
        },
        active: false,
        weight: 1,
      },
      {
        _id: 'aJxunXWZnFwx5YTYm',
        name: 'Split Pea & Lentil Soup',
        category: 'Meal',
        subcategory: 'Soup',
        description: 'Details coming soon...',
        createdAt: '2018-05-06T06:42:18.178Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: ['Details coming soon...'],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/coming-soon.jpg',
        goodFor_Days: 5,
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: true, glutenFree: true, highProtein: false, paleo: false, vegan: true, vegetarian: true,
        },
        weight: 3,
        ordersThisWeek: 0,
        ordersTotal: 0,
      },
    ];

    // {"name":"Chicken w/ Mushrooms","id":"CH-008","category":"Meal","subcategory":"Chicken","description":"celeriac, sweet potato, cherry tomatoes, fresh herbs","createdAt":"2017-01-29T16:58:24.601Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["Chicken","White Mushrooms","Portobello Mushrooms","Celeriac","Sweet Potatoes","Cherry Tomatoes","Onions","Parsley","Garlic","Extra Virgin Olive Oil","Rosemary","Black Pepper","Thyme","Salt"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":true,"fish":false,"shellfish":false,"eggs":false,"milk":false,"wheat":false},"photo":"/images/menu/1.jpg","goodFor_Days":5,"packs":{"omnivorePack":false,"vegetarianPack":false},"nutritionFacts":{"servingSize":"415","calories":"360","totalFat":"10","saturatedFat":"2","transFat":"0","protein":"42","totalCarb":"28","sodium":"390","cholesterol":"100","dietaryFiber":"6","sugars":"5","PDV":{"vitaminA":"15","vitaminC":"45","calcium":"8","iron":"25"}},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":true,"paleo":true,"vegan":false,"vegetarian":false},"active":false,"weight":"3"},
    // {"name":"Chicken w/ Turmeric Mayo","id":"CH-019","category":"Meal","subcategory":"Chicken","description":"sweet potato, eggplant, cherry tomato","createdAt":"2017-09-17T18:30:36.147Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["chicken breast","eggplant","cherry tomatoes","sweet potato","red onion","chickpeas","lemon juice","lime juice","ginger","turmeric","sumac","parsley","garlic","extra virgin olive oil","sunflower oil","black pepper","thyme","salt"],"photo":"/images/menu/142.jpg","goodFor_Days":5,"packs":{"omnivorePack":false,"vegetarianPack":false},"nutritionFacts":{"PDV":{"vitaminA":"290","vitaminC":"70","calcium":"8","iron":"25"},"servingSize":"380","calories":"300","totalFat":"8","saturatedFat":"1.5","transFat":"0","cholesterol":"50","sodium":"340","totalCarb":"39","dietaryFiber":"8","sugars":"10","protein":"21"},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":false,"vegetarian":false},"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":true,"fish":false,"shellfish":false,"milk":false,"eggs":true,"wheat":false},"ordersThisWeek":0,"ordersTotal":0,"active":false,"weight":3},
    // {"name":"Maple Balsamic Tempeh","id":"SY-012","category":"Meal","subcategory":"Soy","description":"sweet potato, braised kale, black beans, golden raisins","createdAt":"2017-02-26T19:09:31.159Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["tempeh (Soy)","sweet potato","kale","black beans","leeks","golden raisins","extra virgin olive oil","balsamic vinegar","garlic","rosemary","maple syrup","thyme","salt","black pepper"],"warnings":{"peanuts":false,"treenuts":false,"soy":true,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":false,"wheat":false},"photo":"/images/menu/46.jpg","goodFor_Days":4,"packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"nutritionFacts":{"servingSize":"378","calories":"530","totalFat":"22","saturatedFat":"6","transFat":"0","protein":"33","totalCarb":"58","sodium":"200","cholesterol":"0","dietaryFiber":"16","sugars":"19","PDV":{"vitaminA":"510","vitaminC":"60","calcium":"25","iron":"30"}},"attributes":{"dairyFree":true,"glutenFree":false,"highProtein":true,"paleo":false,"vegan":true,"vegetarian":true},"active":false,"weight":3},
    // {"name":"Bunless Beet Burger","id":"VT-005","category":"Meal","subcategory":"Vegetable","description":"broccoli, sweet potatoes, tomatoes, ginger fayo","createdAt":"2017-02-19T20:43:43.123Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["beans","cauliflower","red beets","chickpeas","shallots","sweet potatoes","tomatoes","broccoli","ground flaxseed","egg (EGG)","onion","aquafaba (water, salt, chickpeas)","sesame seeds","extra virgin olive oil","ginger","cilantro","parsley","garlic","paprika","cajun spices","rosemary","salt","black pepper"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":true,"wheat":false},"photo":"/images/menu/44.jpg","goodFor_Days":4,"packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"nutritionFacts":{"servingSize":"370","calories":"300","totalFat":"10","saturatedFat":"1.5","transFat":"0","protein":"12","totalCarb":"46","sodium":"320","cholesterol":"40","dietaryFiber":"10","sugars":"12","PDV":{"vitaminA":"40","vitaminC":"140","calcium":"15","iron":"25"}},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":false,"vegan":false,"vegetarian":true},"active":false,"weight":3},
    // {"name":"Stuffed Eggplant","id":"VT-021","category":"Meal","subcategory":"Vegetable","description":"cayenne potato, shallot, raisins, pine nuts, braised kale with balsamic vinegar, squash, braised grapes","createdAt":"2017-01-26T21:44:31.131Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["Eggplant","Squash","Kale","Potatoes","Grapes","Shallots","Golden Raisins","Extra Virgin Olive Oil","Lemon","Cayenne Pepper","Balsamic Vinegar","Pine Nuts","Garlic","Parsley","Paprika","Thyme","Salt","Black Pepper"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":false,"wheat":false},"photo":"/images/menu/35.jpg","goodFor_Days":5,"packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"nutritionFacts":{"servingSize":"344","calories":"310","totalFat":"12","saturatedFat":"1.5","transFat":"0","protein":"7","totalCarb":"54","sodium":"190","cholesterol":"0","dietaryFiber":"11","sugars":"21","PDV":{"vitaminA":"280","vitaminC":"130","calcium":"15","iron":"20"}},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":false,"vegan":true,"vegetarian":true},"active":false,"weight":3},
    // {"name":"Black Rice w/ Sambal Cauliflower","category":"Meal","subcategory":"Grain","description":"chickpeas, peppers, scallions, sesame seeds","createdAt":"2018-02-04T16:45:17.053Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["black rice","red peppers","cauliflower","chickpeas","scallions","chili paste (chili, salt, distilled vinegar, citric acid","cilantro","hemp seeds","lemon","sumac","sesame oil","extra virgin olive oil","parsley","garlic","lime","thyme","salt","black pepper"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":false,"wheat":false},"photo":"/images/menu/179.jpg","goodFor_Days":5,"packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"nutritionFacts":{"PDV":{"vitaminA":"80","vitaminC":"270","calcium":"10","iron":"30"},"servingSize":"358","calories":"660","totalFat":"20","saturatedFat":"2","transFat":"0","cholesterol":"0","sodium":"410","totalCarb":"108","dietaryFiber":"16","sugars":"10","protein":"23"},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":true,"vegetarian":true},"weight":2,"ordersThisWeek":0,"ordersTotal":0,"active":false},
    // {"name":"Dashi Ginger Quinoa","id":"G-009","category":"Meal","subcategory":"Grain","description":"fresh market mushroom, ginger, fresh coriander, parsley, lime","createdAt":"2017-01-26T22:01:40.720Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["Quinoa","Tomatoes","White Mushrooms","Portobello Mushrooms","Shallots","Extra Virgin Olive Oil","Lime","Cilantro","Parsley","Dried Shiitake Mushroom","Garlic","Ground Ginger","Kombu","Thyme","Salt","Black Pepper"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":false,"wheat":false},"photo":"/images/menu/10.jpg","goodFor_Days":4,"packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"nutritionFacts":{"servingSize":"342","calories":"270","totalFat":"10","saturatedFat":"1.5","transFat":"0","protein":"9","totalCarb":"41","sodium":"210","cholesterol":"0","dietaryFiber":"8","sugars":"8","PDV":{"vitaminA":"20","vitaminC":"60","calcium":"6","iron":"25"}},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":true,"vegetarian":true},"active":false,"weight":2},
    // {"name":"Spicy Cauliflower Soup","id":"SP-022","category":"Meal","subcategory":"Soup","description":"black sesame seeds, sumac","createdAt":"2017-06-11T09:12:52.259Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["cauliflower","onion","leeks","shallots","sesame seeds","thyme","sumac","parsley","garlic","extra virgin olive oil","chipotle pepper","salt","cayenne pepper","black pepper"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":false,"wheat":false},"photo":"/images/menu/95.jpg","goodFor_Days":5,"packs":{"omnivorePack":false,"vegetarianPack":false},"nutritionFacts":{"PDV":{"vitaminA":"25","vitaminC":"170","calcium":"20","iron":"25"},"servingSize":"340","calories":"170","totalFat":"7","saturatedFat":"1","transFat":"0","cholesterol":"0","sodium":"300","totalcarb":"25","dietaryFiber":"8","sugars":"9","protein":"7"},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":true,"vegetarian":true},"ordersThisWeek":0,"ordersTotal":0,"active":false,"weight":0.1},
    // {"name":"Broccoli & Coconut Curry Soup","id":"SP-003","category":"Meal","subcategory":"Soup","description":"broccoli florets, white sesame seeds","createdAt":"2017-07-09T16:00:18.039Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["broccoli","onion","sweet potato","shallots","coconut milk","cilantro","white sesame seeds","black pepper","garlic","coconut oil","cumin","ginger","coriander powder","curry powder","thyme","salt"],"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":false,"eggs":false,"wheat":false},"photo":"/images/menu/118.jpg","packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"nutritionFacts":{"PDV":{"vitaminA":"190","vitaminC":"270","calcium":"25","iron":"30"},"servingSize":"320","calories":"210","totalFat":"8","saturatedFat":"3","transFat":"0","cholesterol":"0","sodium":"370","totalCarb":"34","dietaryFiber":"13","sugars":"7","protein":"9"},"attributes":{"dairyFree":true,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":true,"vegetarian":true},"ordersThisWeek":0,"ordersTotal":0,"active":false,"weight":1},
    // {"name":"Arugula & Beets","id":"SD-002","category":"Meal","subcategory":"Salad","description":"black rice, walnuts, golden raisins","createdAt":"2017-02-19T21:01:03.501Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["arugula","brussels sprouts","beets","black rice","chives","lemon","oranges","walnuts","golden raisins","parsley","mustard","garlic","buttermilk (MILK, enzymes)","extra virgin olive oil","corn oil","brown sugar","salt","black pepper"],"warnings":{"peanuts":false,"treenuts":true,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":true,"eggs":false,"wheat":false},"photo":"/images/menu/43.jpg","goodFor_Days":3,"packs":{"omnivorePack":false,"vegetarianPack":false,"veganPack":false},"attributes":{"dairyFree":false,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":false,"vegetarian":true},"active":false,"nutritionFacts":{"servingSize":"322","calories":"320","totalFat":"12","saturatedFat":"1.5","transFat":"0","protein":"12","totalCarb":"50","sodium":"200","cholesterol":"0","dietaryFiber":"8","sugars":"13","PDV":{"vitaminA":"90","vitaminC":"150","calcium":"30","iron":"25"}},"weight":1.5},
    // {"name":"Halloumi & Olive Salad","id":"SD-008","category":"Meal","subcategory":"Salad","description":"chickpeas, purple cabbage, cucumber","createdAt":"2017-10-01T16:04:31.934Z","userId":"dvC2r25nr8JkyaMhP","ingredients":["chickpeas","tomatoes","cabbage","cucumber","red onion","black olives","halloumi (MILK)","lemon juice","extra virgin olive oil","parsley","mustard","champagne vinegar","garlic","paprika","mint","black pepper","salt"],"photo":"/images/menu/151.jpg","goodFor_Days":3,"packs":{"omnivorePack":false,"vegetarianPack":false},"nutritionFacts":{"PDV":{}},"attributes":{"dairyFree":false,"glutenFree":true,"highProtein":false,"paleo":true,"vegan":false,"vegetarian":true},"ordersThisWeek":0,"ordersTotal":0,"active":false,"warnings":{"peanuts":false,"treenuts":false,"soy":false,"beef":false,"chicken":false,"fish":false,"shellfish":false,"milk":true,"eggs":false,"wheat":false},"weight":1.5},

    const itemIdsA = [];
    const itemIdsB = [];

    platesA.forEach((item) => {
      switch (item.subcategory) {
        case 'Beef':
          item.rank = 9;
          item.price_per_unit = 17;
          break;
        case 'Chicken':
          item.rank = 9;
          item.price_per_unit = 16;
          break;
        case 'Fish':
          item.rank = 9;
          item.price_per_unit = 17;
          break;
        case 'Soy':
          item.rank = 9;
          item.price_per_unit = 16;
          break;
        case 'Vegetable':
          item.rank = 9;
          item.price_per_unit = 15;
          break;
        case 'Grain':
          item.rank = 5;
          item.price_per_unit = 14;
          break;
        case 'Salad':
          item.rank = 1;
          item.price_per_unit = 12;
          break;
        case 'Soup':
          item.rank = 3;
          item.price_per_unit = 9;
          break;
      }

      const itemId = Items.insert({
        user_id: item.userId,
        created_at: item.createdAt,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        photo: item.photo,
        description: item.description,
        sku: '',
        plans: {},
        ingredients: item.ingredients,
        warnings: item.warnings,
        nutrition_facts: item.nutritionFacts,
        good_for_days: item.goodFor_days,
        active: false,
        attributes: item.attributes,
        comments: {},
        ratings: {},
        producer: 'Fed',
        cost_per_unit: 0,
        price_per_unit: item.price_per_unit,
        unit: 'meal',
        weight: 0,
        dimensions: '',
        inventory: 0,
        rank: item.rank,
      });

      itemIdsA.push(itemId);
    });

    platesB.forEach((item) => {
      switch (item.subcategory) {
        case 'Beef':
          item.rank = 9;
          item.price_per_unit = 17;
          break;
        case 'Chicken':
          item.rank = 9;
          item.price_per_unit = 16;
          break;
        case 'Fish':
          item.rank = 9;
          item.price_per_unit = 17;
          break;
        case 'Soy':
          item.rank = 9;
          item.price_per_unit = 16;
          break;
        case 'Vegetable':
          item.rank = 9;
          item.price_per_unit = 15;
          break;
        case 'Grain':
          item.rank = 5;
          item.price_per_unit = 14;
          break;
        case 'Salad':
          item.rank = 1;
          item.price_per_unit = 12;
          break;
        case 'Soup':
          item.rank = 3;
          item.price_per_unit = 9;
          break;
      }

      const itemId = Items.insert({
        user_id: item.userId,
        created_at: item.createdAt,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        photo: item.photo,
        description: item.description,
        stripe_product_id: '',
        stripe_plans: {},
        ingredients: item.ingredients,
        warnings: item.warnings,
        nutrition_facts: item.nutritionFacts,
        good_for_days: item.goodFor_days,
        active: false,
        attributes: item.attributes,
        comments: {},
        ratings: {},
        producer: 'Fed',
        cost_per_unit: 0,
        price_per_unit: item.price_per_unit,
        unit: 'meal',
        weight: 0,
        dimensions: '',
        inventory: 0,
        rank: item.rank,
      });

      itemIdsB.push(itemId);
    });

    const snacks = [
      {
        name: 'Antioxidant Energy Bar', id: 'SN-002', course: 'Snack', description: 'Superfruits and oats, wrapped in silky dark chocolate', ingredients: ['figs', 'dates', 'cherries', 'mango', 'goji berry', 'sunflower seeds', 'oats', 'dark chocolate', 'sea salt'], createdAt: '2016-10-31T06:23:06.107Z', userId: 'dvC2r25nr8JkyaMhP', active: true, photo: '/images/menu/0.jpg', cost_per_unit: 2.07, price_per_unit: 3, unit: 'bar',
      },
      {
        name: 'Cranberry Energy Bites', id: 'SN-003', course: 'Snack', description: 'Artisanal fruit & nut bites', ingredients: ['dried cranberry', 'pistachio', 'dates', 'maple syrup', 'ground flax seeds', 'pumpkin seeds', 'chocolate chips'], createdAt: '2016-10-10T08:57:41.409Z', userId: 'dvC2r25nr8JkyaMhP', active: true, photo: '/images/menu/00.jpg', cost_per_unit: 2.29, price_per_unit: 3.5, unit: 'pouch',
      },
      {
        name: 'Spicy Oven-Roasted Chickpeas',
        id: 'SN-001',
        course: 'Snack',
        description: 'A hot little pack of protein',
        ingredients: ['sumac', 'chipotle pepper', 'cayenne pepper'],
        createdAt: '2017-07-08T22:43:59.796Z',
        userId: 'dvC2r25nr8JkyaMhP',
        ingredients: [],
        warnings: {
          peanuts: false, treenuts: false, soy: false, beef: false, chicken: false, fish: false, shellfish: false, milk: false, eggs: false, wheat: false,
        },
        photo: '/images/menu/0000.jpg',
        packs: { omnivorePack: false, vegetarianPack: false },
        nutritionFacts: { PDV: {} },
        attributes: {
          dairyFree: false, glutenFree: false, highProtein: false, paleo: false, vegan: false, vegetarian: false,
        },
        ordersThisWeek: 0,
        ordersTotal: 0,
        active: true,
        cost_per_unit: 1.7,
        price_per_unit: 2.5,
        unit: 'pouch',
      },
    ];

    snacks.forEach((item) => {
      const itemId = Items.insert({
        user_id: item.userId,
        created_at: item.createdAt,
        name: item.name,
        category: 'Snack',
        photo: item.photo,
        description: item.description,
        stripe_product_id: '',
        stripe_plans: {},
        ingredients: item.ingredients,
        warnings: {
          peanuts: false,
          treenuts: false,
          soy: false,
          beef: false,
          chicken: false,
          fish: false,
          shellfish: false,
          milk: false,
          eggs: false,
        },
        nutrition_facts: item.nutritionFacts || {},
        good_for_days: 7,
        active: true,
        attributes: {
          dairyFree: true,
          glutenFree: true,
          paleo: false,
          vegan: true,
          vegetarian: true,
        },
        comments: {},
        ratings: {},
        producer: 'Fed',
        cost_per_unit: item.cost_per_unit,
        price_per_unit: item.price_per_unit,
        unit: item.unit,
        weight: 0,
        dimensions: '',
        inventory: 0,
        rank: 5,
      });
    });

    // const products = [
    //   {
    //   //   name: 'Probiotic Smoothie',
    //   //   category: 'Drink',
    //   //   description: 'Supports digestive and immune health with active vegan probiotics',
    //   //   ingredients: [
    //   //     'PURIFIED WATER',
    //   //     'BANANA',
    //   //     'COCONUT NECTAR',
    //   //     'LEMON JUICE',
    //   //     'ALMOND',
    //   //     'COCONUT OIL',
    //   //     'PEA PROTEIN',
    //   //     'FLAX SEED',
    //   //     'PINK HIMALAYAN SEA SALT',
    //   //     'GANEDENBC30 VEGAN PROBIOTIC (BACILLUS COAGULANS GBI-30 6086)'
    //   //   ],
    //   //   warnings: {
    //   //     'peanuts':false,
    //   //     'treenuts':true,
    //   //     'soy':false,
    //   //     'beef':false,
    //   //     'chicken':false,
    //   //     'fish':false,
    //   //     'shellfish':false,
    //   //     'milk':false,
    //   //     'eggs':false,
    //   //     'wheat':false
    //   //   },
    //   //   nutrition_facts: {
    //   //     "servingSize":"16",
    //   //     "calories":"280",
    //   //     "totalFat":"18",
    //   //     "protein":"10",
    //   //     "totalCarb":"28",
    //   //     "sodium":"190",
    //   //     "dietaryFiber":"5",
    //   //     "sugars":"14",
    //   //     "PDV":{
    //   //       "vitaminA":"2",
    //   //       "vitaminC":"30",
    //   //       "calcium":"6",
    //   //       "iron":"4"
    //   //     },
    //   //   },
    //   //   good_for_days: 21,
    //   //   active: true,
    //   //   attributes: {
    //   //     "dairyFree":true,
    //   //     "glutenFree":true,
    //   //     "highProtein":true,
    //   //     "paleo":true,
    //   //     "vegan":true,
    //   //     "vegetarian":true
    //   //   },
    //   //   comments: {},
    //   //   ratings: {},
    //   //   producer: 'Metabrew',
    //   //   cost_per_unit: 3.4,
    //   //   price_per_unit: 4.99,
    //   //   unit: 'bottle',
    //   //   inventory: 10,
    //   // },

    //   {
    //     name: 'Antioxidant Energy Bar',
    //     category: 'Snack',
    //     description: 'High power granola bar',
    //     ingredients: ["chocolate","granola","goji berries"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':false,
    //       'soy':true,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 7,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":false,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Fed Foods',
    //     cost_per_unit: 2.07,
    //     price_per_unit: 3,
    //     unit: 'bag',
    //     inventory: 10,
    //   },
    //   {
    //     name: 'Cranberry Energy Bites',
    //     category: 'Snack',
    //     description: 'Chocolate salty balls. Put em in your mouth.',
    //     ingredients: ["chocolate","salt","balls"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':true,
    //       'soy':true,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 7,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":true,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Fed Foods',
    //     cost_per_unit: 2.29,
    //     price_per_unit: 3.49,
    //     unit: 'bag',
    //     inventory: 10,
    //   },
    //   {
    //     name: 'Spicy Oven-Roasted Chickpeas',
    //     category: 'Snack',
    //     description: 'Dey hot bitch!',
    //     ingredients: ["chickpeas","spicy","oven"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':false,
    //       'soy':false,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 7,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":true,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Fed Foods',
    //     cost_per_unit: 1.70,
    //     price_per_unit: 2.49,
    //     unit: 'bag',
    //     inventory: 10,
    //   },
    //   {
    //     name: 'Love Grace Bomb',
    //     category: 'Drink',
    //     description: 'Sent via drone',
    //     ingredients: ["love","grace","bomb"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':false,
    //       'soy':false,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 21,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":true,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Love Grace',
    //     cost_per_unit: 4,
    //     price_per_unit: 6,
    //     unit: 'bottle',
    //     inventory: 10,
    //   },
    //   {
    //     name: 'Love Grace Herbal Tea',
    //     category: 'Drink',
    //     description: 'CHILL THE FUCK OUT',
    //     ingredients: ["love","grace","herb"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':false,
    //       'soy':false,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 21,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":true,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Love Grace',
    //     cost_per_unit: 3.40,
    //     price_per_unit: 5,
    //     unit: 'bottle',
    //     inventory: 10,
    //   },
    //   {
    //     name: 'Love Grace Smoothie',
    //     category: 'Drink',
    //     description: 'Smooooooooooooooooooooooooooooth',
    //     ingredients: ["love","grace","smooth"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':false,
    //       'soy':false,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 21,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":true,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Love Grace',
    //     cost_per_unit: 6.5,
    //     price_per_unit: 10,
    //     unit: 'bottle',
    //     inventory: 10,
    //   },
    //   {
    //     name: 'Gluten-free Olive Oil Focaccia',
    //     category: 'Grocery',
    //     description: 'So. Fucking. Good.',
    //     ingredients: ["bread","focaccia","olive oil"],
    //     warnings: {
    //       'peanuts':false,
    //       'treenuts':false,
    //       'soy':false,
    //       'beef':false,
    //       'chicken':false,
    //       'fish':false,
    //       'shellfish':false,
    //       'milk':false,
    //       'eggs':false,
    //       'wheat':false
    //     },
    //     nutrition_facts: {
    //       "servingSize":"415",
    //       "calories":"470",
    //       "totalFat":"19",
    //       "saturatedFat":"4",
    //       "transFat":"0",
    //       "protein":"36",
    //       "totalCarb":"40",
    //       "sodium":"300",
    //       "cholesterol":"80",
    //       "dietaryFiber":"7",
    //       "sugars":"14",
    //       "PDV":{
    //         "vitaminA":"390",
    //         "vitaminC":"110",
    //         "calcium":"15",
    //         "iron":"30"
    //       },
    //     },
    //     good_for_days: 5,
    //     active: true,
    //     attributes: {
    //       "dairyFree":true,
    //       "glutenFree":true,
    //       "highProtein":true,
    //       "paleo":true,
    //       "vegan":true,
    //       "vegetarian":true
    //     },
    //     comments: {},
    //     ratings: {},
    //     producer: 'Love Grace',
    //     cost_per_unit: 4,
    //     price_per_unit: 6,
    //     unit: 'bottle',
    //     inventory: 10,
    //   },
    // ];

    // products.forEach((item) => {
    //   const itemId = Items.insert({
    //     user_id: "uG99TZE9tpeLtvqnF",
    //     created_at: new Date(timestamp),
    //     name: item.name,
    //     category: item.category,
    //     description: item.description,
    //     ingredients: item.ingredients,
    //     warnings: item.warnings,
    //     nutrition_facts: item.nutrition_facts,
    //     good_for_days: item.good_for_days,
    //     active: item.active,
    //     attributes: item.attributes,
    //     comments: {},
    //     ratings: {},
    //     producer: item.producer,
    //     cost_per_unit: item.cost_per_unit,
    //     price_per_unit: item.price_per_unit,
    //     unit: item.unit,
    //     inventory: item.inventory,
    //   });

    //   timestamp += 1; // ensure unique timestamp.
    // });

    const packs = [
      {
        name: 'Omnivore 4-Pack',
        price: 63,
        schema: {
          protein: 1,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 0,
          total: 4,
        },
      },
      {
        name: 'Omnivore 6-Pack',
        price: 87.37,
        schema: {
          protein: 2,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 6,
        },
      },
      {
        name: 'Omnivore 8-Pack',
        price: 120.53,
        schema: {
          protein: 3,
          vegetable: 2,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 8,
        },
      },
      {
        name: 'Omnivore 10-Pack',
        price: 152.63,
        schema: {
          protein: 4,
          vegetable: 2,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 10,
        },
      },
      {
        name: 'Omnivore 12-Pack',
        price: 185.79,
        schema: {
          protein: 5,
          vegetable: 3,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 12,
        },
      },
      {
        name: 'Paleo 4-Pack',
        price: 63,
        schema: {
          protein: 1,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 0,
          total: 4,
        },
      },
      {
        name: 'Paleo 6-Pack',
        price: 88.42,
        schema: {
          protein: 2,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 6,
        },
      },
      {
        name: 'Paleo 8-Pack',
        price: 118.42,
        schema: {
          protein: 3,
          vegetable: 2,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 8,
        },
      },
      {
        name: 'Paleo 10-Pack',
        price: 151.58,
        schema: {
          protein: 4,
          vegetable: 2,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 10,
        },
      },
      {
        name: 'Paleo 12-Pack',
        price: 178.42,
        schema: {
          protein: 5,
          vegetable: 3,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 12,
        },
      },
      {
        name: 'Pescetarian 4-Pack',
        price: 64.05,
        schema: {
          protein: 1,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 0,
          total: 4,
        },
      },
      {
        name: 'Pescetarian 6-Pack',
        price: 88.42,
        schema: {
          protein: 2,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 6,
        },
      },
      {
        name: 'Pescetarian 8-Pack',
        price: 118.95,
        schema: {
          protein: 2,
          vegetable: 2,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 8,
        },
      },
      {
        name: 'Pescetarian 10-Pack',
        price: 152.63,
        schema: {
          protein: 3,
          vegetable: 3,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 10,
        },
      },
      {
        name: 'Pescetarian 12-Pack',
        price: 183.16,
        schema: {
          protein: 3,
          vegetable: 4,
          grain: 3,
          salad: 1,
          soup: 1,
          total: 12,
        },
      },
      {
        name: 'Vegetarian 4-Pack',
        price: 60.90,
        schema: {
          protein: 1,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 0,
          total: 4,
        },
      },
      {
        name: 'Vegetarian 6-Pack',
        price: 85.26,
        schema: {
          protein: 1,
          vegetable: 2,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 6,
        },
      },
      {
        name: 'Vegetarian 8-Pack',
        price: 117.89,
        schema: {
          protein: 2,
          vegetable: 3,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 8,
        },
      },
      {
        name: 'Vegetarian 10-Pack',
        price: 149.47,
        schema: {
          protein: 3,
          vegetable: 3,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 10,
        },
      },
      {
        name: 'Vegetarian 12-Pack',
        price: 180,
        schema: {
          protein: 3,
          vegetable: 4,
          grain: 3,
          salad: 1,
          soup: 1,
          total: 12,
        },
      },
      {
        name: 'Vegan 4-Pack',
        price: 60.90,
        schema: {
          protein: 1,
          vegetable: 1,
          grain: 1,
          salad: 1,
          soup: 0,
          total: 4,
        },
      },
      {
        name: 'Vegan 6-Pack',
        price: 85.26,
        schema: {
          protein: 1,
          vegetable: 2,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 6,
        },
      },
      {
        name: 'Vegan 8-Pack',
        price: 117.89,
        schema: {
          protein: 2,
          vegetable: 3,
          grain: 1,
          salad: 1,
          soup: 1,
          total: 8,
        },
      },
      {
        name: 'Vegan 10-Pack',
        price: 149.47,
        schema: {
          protein: 3,
          vegetable: 3,
          grain: 2,
          salad: 1,
          soup: 1,
          total: 10,
        },
      },
      {
        name: 'Vegan 12-Pack',
        price: 180,
        schema: {
          protein: 3,
          vegetable: 4,
          grain: 3,
          salad: 1,
          soup: 1,
          total: 12,
        },
      },
    ];

    packs.forEach((item) => {
      item.sub_items = {
        schema: item.schema,
        items: [],
      };

      const itemId = Items.insert({
        user_id: 'dvC2r25nr8JkyaMhP',
        created_at: new Date(),
        name: item.name,
        category: 'Pack',
        subcategory: item.name.split(' ')[0].toLowerCase(),
        description: `Fed ${item.name}`,
        comments: {},
        ratings: {},
        producer: 'Fed',
        price_per_unit: item.price,
        unit: 'pack',
        sub_items: item.sub_items,
      });
    });

    const dates = [];

    const now = {
      date: moment().toDate(),
      items: itemIdsA,
      id: 0,
      active: true,
    };
    const nextWeek = {
      date: moment().add(1, 'week').toDate(),
      items: itemIdsB,
      id: 1,
    };
    const twoWeeksFromNow = {
      date: moment().add(2, 'week').toDate(),
      items: itemIdsB,
      id: 2,
    };

    dates.push(now, nextWeek, twoWeeksFromNow);

    dates.forEach((week) => {
      const online_at = moment(week.date).startOf('week').toDate();
      const custom_until = moment(week.date).startOf('week').add(4, 'd').toDate();
      const offline_at = moment(week.date).endOf('week').toDate();
      const ready_by = moment(week.date).endOf('week').add(17, 'h').startOf('hour')
        .toDate();
      const delivery_windows = createDeliveryWindows.call({ ready_by_date: ready_by });

      const menu = {
        created_at: week.date,
        id_number: week.id,
        name: `Menu for ${week.date.toString()}`,
        items: week.items,
        online_at,
        custom_until,
        offline_at,
        ready_by,
        delivery_windows,
        active: week.active,
      };

      const menuId = Menus.insert(menu);

      // for each current subscriber, generate pending-sub order
    });
  }
});
