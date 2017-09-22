import { Meteor } from 'meteor/meteor';
import { Items } from '../../api/items/items.js';

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  if (Items.find().count() === 0) {
    console.log('Creating fixtures...');
    const data = [
      {
        name: 'Chicken Filet',
        course: 'Dish',
        photo: '/images/menu/1.jpg',
        description: 'fresh herbs, roasted mushrooms, celeriac & potato, parsley & mushroom sauce',
        ingredients: [],
        goodFor_Days: 3,
        active: true,
        nutritionFacts: {
          servingSize: '486g',
          calories: '760',
          totalFat: '44g',
          protein: '34g',
          totalCarb: '59g',
          PDV: {'Vitamin A': '8%', 'Vitamin C': '40%', 'Calcium': '10%', 'Iron': '30%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Dill Lemon Salmon',
        course: 'Dish',
        photo: '/images/menu/2.jpg',
        description: 'gluten-free breadcrumbs, snow peas, brussels sprouts, roasted peppers',
        ingredients: [],
        goodFor_Days: 2,
        active: true,
        warnings: ['egg','fish'],
        nutritionFacts: {
          servingSize: '478g',
          calories: '630',
          totalFat: '37g',
          protein: '50g',
          totalCarb: '28g',
          PDV: {'Vitamin A': '90%', 'Vitamin C': '410%', 'Calcium': '15%', 'Iron': '30%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Tower of Roasted Eggplant',
        course: 'Dish',
        photo: '/images/menu/3.jpg',
        description: 'plum tomatoes, zucchini, yellow peppers, avocado & basil dressing, tomato & basil quinoa, parmigiano reggiano',
        ingredients: [],
        goodFor_Days: 3,
        active: true,
        warnings: ['milk','nuts'],
        nutritionFacts: {
          servingSize: '594g',
          calories: '480',
          totalFat: '26g',
          protein: '17g',
          totalCarb: '51g',
          PDV: {'Vitamin A': '70%', 'Vitamin C': '210%', 'Calcium': '25%', 'Iron': '25%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Pan Seared Beets',
        course: 'Dish',
        photo: '/images/menu/4.jpg',
        description: 'brussels sprouts, roasted zucchini, dried sour cherries, walnuts, honey & balsamic dressing, crumbled feta cheese',
        ingredients: [],
        goodFor_Days: 4,
        active: true,
        warnings: ['milk', 'nuts'],
        nutritionFacts: {
          servingSize: '474g',
          calories: '430',
          totalFat: '24g',
          protein: '10g',
          totalCarb: '48g',
          PDV: {'Vitamin A': '30%', 'Vitamin C': '35%', 'Calcium': '15%', 'Iron': '10%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Pan Seared Tempeh',
        course: 'Dish',
        photo: '/images/menu/5.jpg',
        description: 'pomegranate melassa, roasted celeriac & heirloom potato, shallot, leek, golden raisin, fresh herbs',
        ingredients: [],
        goodFor_Days: 3,
        active: true,
        warnings: ['soy'],
        nutritionFacts: {
          servingSize: '610g',
          calories: '610',
          totalFat: '29g',
          protein: '35g',
          totalCarb: '64g',
          PDV: {'Vitamin A': '6%', 'Vitamin C': '35%', 'Calcium': '25%', 'Iron': '35%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Kale Salad',
        course: 'Dish',
        photo: '/images/menu/6.jpg',
        description: 'heirloom tomatoes, pomegranate, yellow peppers, red onion, cucumber, fresh oregano, gluten-free croutons, pomegranate vinegarette',
        ingredients: [],
        goodFor_Days: 2,
        active: true,
        warnings: ['egg'],
        nutritionFacts: {
          servingSize: '299g',
          calories: '260',
          totalFat: '10g',
          protein: '6g',
          totalCarb: '43g',
          PDV: {'Vitamin A': '100%', 'Vitamin C': '210%', 'Calcium': '20%', 'Iron': '15%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Watermelon Salad',
        course: 'Dish',
        photo: '/images/menu/7.jpg',
        description: 'heirloom tomatoes, arugula, red radish, cucumber, pickled red onion, fresh majorana, toasted pine nuts, lemon & thyme pesto',
        ingredients: [],
        goodFor_Days: 2,
        active: true,
        warnings: ['nuts'],
        nutritionFacts: {
          servingSize: '305g',
          calories: '220',
          totalFat: '13g',
          protein: '9g',
          totalCarb: '21g',
          PDV: {'Vitamin A': '50%', 'Vitamin C': '80%', 'Calcium': '30%', 'Iron': '20%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Tomato & Watermelon Gazpacho',
        course: 'Dish',
        photo: '/images/menu/8.jpg',
        description: 'gluten-free croutons, black sesame seeds, micro herbs',
        ingredients: [],
        goodFor_Days: 3,
        active: true,
        nutritionFacts: {
          servingSize: '434g',
          calories: '250',
          totalFat: '9g',
          protein: '6g',
          totalCarb: '39g',
          PDV: {'Vitamin A': '30%', 'Vitamin C': '220%', 'Calcium': '15%', 'Iron': '20%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Black Rice',
        course: 'Dish',
        photo: '/images/menu/9.jpg',
        description: 'peppers, scallion, shallot, haricot pearl beans',
        ingredients: [],
        goodFor_Days: 3,
        active: true,
        nutritionFacts: {
          servingSize: '354g',
          calories: '750',
          totalFat: '25g',
          protein: '23g',
          totalCarb: '122g',
          PDV: {'Vitamin A': '70%', 'Vitamin C': '300%', 'Calcium': '10%', 'Iron': '35%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Dashi Quinoa',
        course: 'Dish',
        photo: '/images/menu/10.jpg',
        description: 'fresh market mushroom, ginger, fresh coriander, parsley, lime',
        ingredients: [],
        goodFor_Days: 3,
        active: true,
        nutritionFacts: {
          servingSize: '342g',
          calories: '270',
          totalFat: '10g',
          protein: '9g',
          totalCarb: '41g',
          PDV: {'Vitamin A': '20%', 'Vitamin C': '60%', 'Calcium': '6%', 'Iron': '25%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Apricot Energy Bites',
        course: 'Snack',
        photo: '/images/menu/11.jpg',
        description: 'dates, dried apricot, honey, almond, chia seeds, moringa powder, orange peel powder',
        ingredients: [],
        goodFor_Days: 7,
        active: true,
        warnings: ['nuts'],
        nutritionFacts: {
          servingSize: '40g',
          calories: '130',
          totalFat: '4.5g',
          protein: '3g',
          totalCarb: '21g',
          PDV: {'Vitamin A': '45%', 'Vitamin C': '20%', 'Calcium': '10%', 'Iron': '10%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Cranberry Energy Bites',
        course: 'Snack',
        photo: '/images/menu/12.jpg',
        description: 'dried cranberry, pistachio, dates, honey, ground flax seeds, pumpkin seeds, chocolate chips',
        ingredients: [],
        goodFor_Days: 7,
        active: true,
        warnings: ['milk', 'nuts'],
        nutritionFacts: {
          servingSize: '40g',
          calories: '150',
          totalFat: '8g',
          protein: '4g',
          totalCarb: '20g',
          PDV: {'Vitamin A': '2%', 'Vitamin C': '8%', 'Calcium': '2%', 'Iron': '6%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      },
      {
        name: 'Dried Fruit & Almonds',
        course: 'Snack',
        photo: '/images/menu/13.jpg',
        description: 'assorted dried fruits & almonds',
        ingredients: [],
        goodFor_Days: 7,
        active: true,
        warnings: ['nuts'],
        nutritionFacts: {
          servingSize: '45g',
          calories: '130',
          totalFat: '4.5g',
          protein: '2g',
          totalCarb: '22g',
          PDV: {'Vitamin A': '15%', 'Vitamin C': '2%', 'Calcium': '4%', 'Iron': '6%'}
        },
        packs: {
          omnivorePack: false,
          vegetarianPack: false,
        },
      }
    ];

    let timestamp = (new Date()).getTime();

    data.forEach((item) => {
      const itemId = Items.insert({
        name: item.name,
        course: item.course,
        photo: item.photo,
        description: item.description,
        goodFor_Days: item.goodFor_Days,
        active: true,
        nutritionFacts: item.nutritionFacts,
        packs: item.packs,
        createdAt: new Date(timestamp),
      });

      timestamp += 1; // ensure unique timestamp.
    });
  };
});
