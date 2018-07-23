import { Template } from 'meteor/templating';

import './cart-item.html';

Template.CartItem.helpers({
  isPack: () => Template.currentData().item.category === 'Pack',

  subItems: () => {
    const subItems = Template.currentData().item.sub_items.items;
    if (!subItems) { return undefined; }

    const dishTally = {};
    for (let i = subItems.length - 1; i >= 0; i -= 1) {
      if (subItems[i] !== '' && !dishTally[subItems[i]]) {
        dishTally[subItems[i]] = 1;
      } else if (subItems[i] !== '') {
        dishTally[subItems[i]] += 1;
      }
    }
    return Object.entries(dishTally).map(([name, value]) => ({ name, value }));
  },
});
