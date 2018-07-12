import { Template } from 'meteor/templating';
import { PackSchemas } from '/imports/api/packs/packs.js';

import './pack-schemas.html';

Template.Pack_schemas.helpers({
  packs: () => {
    const diet = Template.currentData().diet.toLowerCase();
    const packs = Object.values(PackSchemas[diet]);
    return packs;
  },
});

Template.Pack_schema.helpers({
  packName: () => Template.currentData().name,

  packSize: () => Template.currentData().schema.total,

  packOriginalPrice: () => Template.currentData().price,

  packPrice: () => {
    const price = Template.currentData().price * 95 / 100;
    return price.toFixed(2);
  },

  packSchema: () => Template.currentData().schema,

  greaterThanZero: plate => (plate > 0),

  greaterThanOne: plate => (plate > 1) && 's',
});
