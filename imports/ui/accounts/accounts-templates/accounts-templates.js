import { Template } from 'meteor/templating';
import { onLoginFunction } from '/imports/ui/lib/auth';

import './accounts-templates.less';
import './accounts-templates.html';

// We identified the templates that need to be overridden by looking at the available templates
// here: https://github.com/meteor-useraccounts/unstyled/tree/master/lib
Template['override-atPwdFormBtn'].replaces('atPwdFormBtn');
Template['override-atPwdForm'].replaces('atPwdForm');
Template['override-atTextInput'].replaces('atTextInput');
Template['override-atTitle'].replaces('atTitle');
Template['override-atError'].replaces('atError');

Template.Auth_page.events({
  'submit form' ( event, template ) {
    onLoginFunction();
  },
});

Template.SignIn.events({
  'submit form' ( event, template ) {
    onLoginFunction();
  },
});

Template.Forgot_password.events({
  'submit form' ( event, template ) {
    onLoginFunction();
  },
});
