import { lodash } from 'meteor/erasaur:meteor-lodash';

import { ALL_FOODS } from './diet_food_restrictions.js';

export const RESTRICTION_TO_ITEM_RESTRICTION = {
  beef: 'beef',
  chicken: 'chicken',
  fish: 'fish',
  shellfish: 'shellfish',
  dairy: 'milk',
  eggs: 'eggs',
  gluten: 'wheat',
  nuts: 'treenuts',
  peanuts: 'peanuts',
  soy: 'soy',
};

const CATEGORY_TO_PLATE = {
  beef: 'protein',
  chicken: 'protein',
  fish: 'protein',
  soy: 'protein',
  vegetable: 'vegetable',
  grain: 'grain',
  salad: 'salad',
  soup: 'soup',
};

const pickPlateIds = (plateTypeDishIds, numPlate) => {
  const totalDishes = plateTypeDishIds.length;
  const allDishSelectionTimes = Math.floor(numPlate / totalDishes);
  const leftOverSelections = numPlate % totalDishes;

  const leftoverDishes = lodash.chain(plateTypeDishIds)
    .shuffle()
    .take(leftOverSelections)
    .value();

  const repeatedSelection = lodash.chain(allDishSelectionTimes)
    .times(() => plateTypeDishIds)
    .flatten()
    .value();
  return repeatedSelection.concat(leftoverDishes);
};

export const getPack = (packItems, packType) => {
  const { name: packName, number: packNumber } = packType;

  const computedPackItems = lodash
    .chain(packItems)
    .groupBy(({ subcategory }) => subcategory)
    .toPairs()
    .map(([subcategory, subcategoryItemArray]) => [
      subcategory,
      lodash
        .chain(subcategoryItemArray)
        .map(({ sub_items: { schema } }) => schema)
        .keyBy(({ total }) => total)
        .value(),
    ])
    .fromPairs()
    .value();

  return computedPackItems[packName][packNumber];
};

const flatten = (arr) => [].concat(...arr);

const times = (numTimes, doSomething) =>
  Array.from(Array(numTimes)).map(doSomething);

export const generateSlots = ({ total: _, ...packSchemaWithoutTotal }, userId, userDietRestrictions) =>
  flatten(
    Object.entries(packSchemaWithoutTotal)
      .map(([category, numberInCategory]) => (
        times(numberInCategory, () => ({
          user_id: userId,
          sub_id: null,
          category,
          restrictions: userDietRestrictions,
          is_static: false,
        }))
      )));

export const generateDefaultPack = (pack, restrictions, itemChoices, allItems) => {
  const {
    total: totalPlates,
    ...plateNumbers
  } = pack;

  const rejectedFoods = lodash.difference(ALL_FOODS, restrictions);

  const allowedDishes = lodash.filter(allItems,
    ({ warnings }) => !lodash.some(rejectedFoods,
      food => warnings[RESTRICTION_TO_ITEM_RESTRICTION[food]]));

  const categoryGroupedDishes = lodash.groupBy(
    allowedDishes,
    dish => CATEGORY_TO_PLATE[dish.subcategory.toLowerCase()],
  );

  const idcounts = lodash
    .chain(plateNumbers)
    .toPairs()
    .map(([plateType, numPlate]) => {
      const plateTypeDishIds = lodash.map(categoryGroupedDishes[plateType], '_id');
      const plateSelection = pickPlateIds(plateTypeDishIds, numPlate);
      return plateSelection;
    })
    .flatten()
    .countBy()
    .value();

  const numberToItem = lodash.chain(idcounts)
    .toPairs()
    .map(
      ([plateId, numberOfPlate]) => [
        numberOfPlate,
        lodash.find(itemChoices,
          item => item._id === plateId)],
    )
    .value();

  const numDishes = numberToItem.reduce((sum, [num]) => sum + num, 0);

  return {
    idcounts,
    numberToItem,
    numDishes,
    expectedNumDishes: totalPlates,
    complete: numDishes === totalPlates,
  };
};


