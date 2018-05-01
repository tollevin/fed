import { ALL_PACKS } from './all_packs.js';
import { ALL_ITEMS } from './all_items.js';
import { ALL_FOODS } from './diet_food_restrictions.js';

const RESTRICTION_TO_ITEM_RESTRICTION = {
  beef: "beef",
  chicken: "chicken",
  fish: "fish",
  shellfish: "shellfish",
  dairy: "milk",
  eggs: "eggs",
  gluten: "wheat",
  nuts: "treenuts",
  peanuts: "peanuts",
  soy: "soy"
};

const CATEGORY_TO_PLATE = {
  beef: "protein",
  chicken: "protein",
  fish: "protein",
  soy: "protein",
  vegetable: "vegetable",
  grain: "grain",
  salad: "salad",
  soup: "soup",
};

const pickPlateIds = (plateTypeDishIds, numPlate) => {
  const totalDishes = plateTypeDishIds.length;
  const allDishSelectionTimes = Math.floor(numPlate/totalDishes);
  const leftOverSelections = numPlate % totalDishes;

  const leftoverDishes =
    lodash.chain(plateTypeDishIds)
      .shuffle()
      .take(leftOverSelections)
      .value();

  const repeatedSelection =
    lodash.chain(allDishSelectionTimes)
      .times(() => plateTypeDishIds)
      .flatten()
      .value()
  return repeatedSelection.concat(leftoverDishes);
}

export const getPack = (packType) => {
  const {name: packName, number: packNumber} = packType;
  return ALL_PACKS[packName][packNumber];
}

export const generateDefaultPack = (pack, restrictions, itemChoices) => {
  const {
    total: totalPlates,
    ...plateNumbers
  } = pack.plates;

  const rejectedFoods =
    lodash.difference(ALL_FOODS, restrictions)

  const allowedDishes =
    lodash.filter(ALL_ITEMS, ({warnings}) =>
      !lodash.some(rejectedFoods, (food) =>
        warnings[RESTRICTION_TO_ITEM_RESTRICTION[food]]));

  const categoryGroupedDishes =
    _.groupBy(allowedDishes, (dish) => CATEGORY_TO_PLATE[dish.subcategory.toLowerCase()]);

  const idcounts =
    lodash
      .chain(plateNumbers)
      .toPairs()
      .map(([plateType, numPlate]) => {
        const plateTypeDishIds = lodash.map(categoryGroupedDishes[plateType], "id");
        const plateSelection = pickPlateIds(plateTypeDishIds, numPlate);
        return plateSelection;
      })
    .flatten()
    .countBy()
    .value();

  const numberToItem =
    lodash.chain(idcounts)
      .toPairs()
      .map(([plateId, numberOfPlate]) =>
        [numberOfPlate, lodash.find(itemChoices, (item) => item.id === +plateId)])
      .value();

  const numDishes = numberToItem.reduce((sum, [num]) => sum + num, 0);

  return {
    idcounts,
    numberToItem,
    numDishes,
    expectedNumDishes: totalPlates, 
    complete: numDishes === totalPlates
  };
}