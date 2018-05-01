import './pack-schemas.html';

import {
	PackSchemas
} from '../../api/packs/packs.js'

Template.Pack_schemas.helpers({
	packs: ()=> {
		const diet = Template.currentData().diet.toLowerCase();
		const packs = Object.values(PackSchemas[diet]);
		return packs;
	},
});

Template.Pack_schema.helpers({
	packName: ()=> {
		return Template.currentData().name;
	},

	packSize: ()=> {
		return Template.currentData().schema.total;
	},

	packOriginalPrice: ()=> {
		return Template.currentData().price;
	},

	packPrice: ()=> {
		const price = Template.currentData().price * 95 / 100;
		return price.toFixed(2);
	},

	packSchema: ()=> {
		return Template.currentData().schema;
	},

	greaterThanZero: (plate)=> {
		return (plate > 0);
	},

	greaterThanOne: (plate)=> {
		return (plate > 1) && 's';
	},
});