import { Template } from 'meteor/templating';

import './index.html';

Template.Wiki_index.helpers({
  body() {
    return ('Fed _Wiki_');
  },
});
