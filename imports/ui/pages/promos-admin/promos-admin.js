import { Template } from 'meteor/templating';
import { Promos } from '/imports/api/promos/promos.js';

// Components used inside the template
import '/imports/ui/components/new-promo/new-promo.js';
import '/imports/ui/components/promo-admin/promo-admin.js';

import './promos-admin.html';

Template.Promos_admin.onCreated(function promosAdminOnCreated() {
  this.autorun(() => {
    this.subscribe('all.promos', 100);
  });
});

Template.Promos_admin.helpers({
  promos: ()=> {
  	return Promos.find({}, { sort: { createdAt: -1 } });
  },
});