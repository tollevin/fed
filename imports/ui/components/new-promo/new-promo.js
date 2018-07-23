import { Template } from 'meteor/templating';
import { Promos } from '/imports/api/promos/promos.js';
import { insertPromo } from '/imports/api/promos/methods.js';

import './new-promo.html';

Template.NewPromo.helpers({
  promos: () => Promos,

  insertPromo: () => insertPromo,
});

Template.NewPromo.events({
  'click .sbmtPromo'(event, template) {
    event.preventDefault();

    const codes = template.find('[name="code"]').value.split('","');
    const desc = template.find('[name="desc"]').value;
    const credit = template.find('[name="credit"]').value;
    const percentage = template.find('[name="percentage"]').value;
    const expires = template.find('[name="expires"]').value;
    const useLimitPerCustomer = template.find('[name="useLimitPerCustomer"]').value;
    const useLimitTotal = template.find('[name="useLimitTotal"]').value;
    const timesUsed = 0;
    const users = {};
    const active = template.find('[name="active"]').checked;

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
