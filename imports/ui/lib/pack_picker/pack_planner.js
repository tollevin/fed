import { lodash } from 'meteor/erasaur:meteor-lodash';
import PriorityQueue from 'js-priority-queue';

import { ALL_FOODS } from './diet_food_restrictions.js';

export const RESTRICTION_TO_ITEM_RESTRICTION = {
  beef: 'beef',
  chicken: 'chicken',
  fish: 'fish',
  shellfish: 'shellfish',
  dairy: 'milk',
  milk: 'milk', // TODO: This is bad... this is a symptom of a data problem
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

const flatten = arr => [].concat(...arr);

const times = (numTimes, doSomething) => Array.from(Array(numTimes)).map(doSomething);

export const generateSlots = (
  {
    total: _,
    ...packSchemaWithoutTotal
  },
  userId,
  userDietRestrictions,
) => flatten(
  Object.entries(packSchemaWithoutTotal)
    .map(([category, numberInCategory]) => (
      times(numberInCategory, () => ({
        user_id: userId,
        sub_id: null,
        category,
        restrictions: userDietRestrictions,
        is_static: false,
      }))
    )),
);

const rejectedDishes = ({ warnings }, restrictions) => !lodash.some(
  restrictions,
  food => warnings[RESTRICTION_TO_ITEM_RESTRICTION[food]],
);

const allowedDishes = (item, restrictions) => {
  const rejectedFoods = lodash.difference(ALL_FOODS, restrictions);
  return rejectedDishes(item, rejectedFoods);
};

const groupBy = (array, groupFn) => array.reduce((memo, ele) => ({
  ...memo,
  [groupFn(ele)]: [...(memo[groupFn(ele)] || []), ele],
}), {});

// There is a bug here because order matters...
// it should be a very rare case from the users perspective.
const removeUsableItem = (itemCountPriorityQueue, slot) => {
  let aggregatorItemCounts = [];
  let foundMatch = false;
  while (!foundMatch) {
    const chosenItemCount = itemCountPriorityQueue.length
      ? itemCountPriorityQueue.dequeue()
      : null;

    foundMatch = (chosenItemCount === null)
      ? true
      : rejectedDishes(chosenItemCount.item, slot.restrictions);
    aggregatorItemCounts = [chosenItemCount, ...aggregatorItemCounts];
  }
  const [usableItemCount, ...remainderItemCounts] = aggregatorItemCounts;

  remainderItemCounts.forEach(
    itemCount => itemCountPriorityQueue.queue(itemCount),
  );
  return usableItemCount;
};

const getCategory = ({ category }) => category.toLowerCase();
const getSubCategory = ({ subcategory }) => CATEGORY_TO_PLATE[subcategory.toLowerCase()];

const EPSILON = 0.001;

const isChickenItem = ({ warnings }) => !!warnings.chicken;

const initialCountPrioirty = (previousItemsById, item) => {
  const offsetPreviousItem = previousItemsById[item._id] ? EPSILON : 0;
  const offsetChicken = isChickenItem(item) ? -EPSILON : 0;

  return offsetPreviousItem + offsetChicken;
};

export const pickItemsInCategory = (slots, menuItems, previousItems) => {
  const compareNumbers = ({ count: countA }, { count: countB }) => countA - countB;
  const itemCountPriorityQueue = new PriorityQueue({ comparator: compareNumbers });

  const previousItemsById = groupBy(previousItems, item => item._id);

  menuItems.forEach((item) => {
    itemCountPriorityQueue.queue({
      item, count: initialCountPrioirty(previousItemsById, item),
      // this is to not favor items chosen last week
    });
  });

  return slots.map((slot) => {
    const itemCount = removeUsableItem(itemCountPriorityQueue, slot);
    if (!itemCount) { return null; }
    const { item, count } = itemCount;
    itemCountPriorityQueue.queue({ item, count: count + 1 });
    return { item, slot };
  }).filter(a => a);
};

export const chooseItemsUsingSlots = (slots, menuItems, previousPackOrder) => {
  const menuItemsByCategory = groupBy(menuItems, getSubCategory);
  const previousItemBySubCategory = groupBy(
    previousPackOrder.filter(
      item => item.subcategory,
    ), getSubCategory,
  );

  return flatten(Object.entries(groupBy(slots, getCategory))
    .map(([category, categorySlots]) => pickItemsInCategory(
      categorySlots,
      menuItemsByCategory[category] || [],
      previousItemBySubCategory[category] || [],
    )));
};

export const generateDefaultPack = (pack, restrictions, itemChoices) => {
  const { total: totalPlates, ...plateNumbers } = pack;

  const allowedDishesVal = lodash.filter(item => allowedDishes(item, restrictions));

  const categoryGroupedDishes = lodash.groupBy(
    allowedDishesVal,
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
