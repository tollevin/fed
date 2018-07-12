import { Template } from 'meteor/templating';

import './cart-item.html';

Template.CartItem.helpers({
  isPack: () => Template.currentData().item.category === 'Pack',

  subItems: () => {
    const subItems = Template.currentData().item.sub_items.items;
    if (subItems) {
      const dishTally = {};
      for (let i = subItems.length - 1; i >= 0; i--) {
        if (subItems[i] != '' && !dishTally[subItems[i]]) {
          dishTally[subItems[i]] = 1;
        } else if (subItems[i] != '') {
          dishTally[subItems[i]] += 1;
        }
      }
      const result = [];
	    for (const key in dishTally) result.push({ name: key, value: dishTally[key] });
	    return result;
    }
  },
});
