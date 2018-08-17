import { Template } from 'meteor/templating';
import { Promos } from '/imports/api/promos/promos.js';
import { insertPromo } from '/imports/api/promos/methods.js';

import './new-promo.html';

Template.NewPromo.helpers({
  promos: () => Promos,

  insertPromo: () => insertPromo,
});

Template.NewPromo.events({
  'click .sbmtPromo'(event, templateInstance) {
    event.preventDefault();

    const codes = templateInstance.find('[name="code"]').value.split('","');
    const desc = templateInstance.find('[name="desc"]').value;
    const type = templateInstance.find('[name="type"]').value;
    const credit = templateInstance.find('[name="credit"]').value;
    const percentage = templateInstance.find('[name="percentage"]').value;
    const expires = templateInstance.find('[name="expires"]').value;
    const useLimitPerCustomer = templateInstance.find('[name="useLimitPerCustomer"]').value;
    const useLimitTotal = templateInstance.find('[name="useLimitTotal"]').value;
    const timesUsed = 0;
    const users = {};
    const active = templateInstance.find('[name="active"]').checked;

    const promo = {
      codes,
      desc,
      credit,
      percentage,
      expires,
      useLimitPerCustomer,
      useLimitTotal,
      timesUsed,
      users,
      active,
    };

    insertPromo.call(promo, (err) => {
      if (err) {
        alert(err); // eslint-disable-line no-alert
      }
    });
  },
});
