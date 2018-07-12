import { Template } from 'meteor/templating';

import './cart-item.html';

Template.CartItem.helpers({
	isPack: ()=> {
		return Template.currentData().item.category === 'Pack';
	},

	subItems: ()=> {
		const subItems = Template.currentData().item.sub_items.items;
		if (subItems) { return undefined; }

		const dishTally =
		  subItems.reduce((memo, item) => ({...memo, [item]: (memo[item] || 0) + 1}), {})

  	return Object
  	  .entries(dishTally)
  	  .map(([key, value]) => ({name: key, value}))
  	  .filter(({name}) => name);
	},
});
