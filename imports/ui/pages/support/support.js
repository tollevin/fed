import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import '/imports/ui/components/footer/footer.js';

import './support.less';
import './support.html';
// Components used inside the template

Template.Support_page.onCreated(function supportOnCreated() {
  Session.set('cartOpen', false);
});
