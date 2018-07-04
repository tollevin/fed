import { FlowRouter } from 'meteor/kadira:flow-router';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { lodash } from 'meteor/erasaur:meteor-lodash';

// Import user templates

import { mainRoutes, mainNotFound, adminRoutes } from '/imports/ui/routes.js';

import '/imports/ui/layouts/app-body/app-body.js';
import '/imports/ui/pages/landing-page/landing-page.js';
import '/imports/ui/pages/user-home/user-home.js';
import '/imports/ui/pages/menu-page/menu-page.js';
import '/imports/ui/pages/market-page/market-page.js';
import '/imports/ui/pages/about-page/about-page.js';
import '/imports/ui/pages/support/support.js';
import '/imports/ui/pages/blog-page/blog-page.js';
import '/imports/ui/pages/item-detail/item-detail.js';
import '/imports/ui/pages/checkout-page/checkout-page.js';
import '/imports/ui/pages/confirmation-page/confirmation-page.js';
import '/imports/ui/pages/success/success.js';
import '/imports/ui/pages/account-page/account-page.js';
import '/imports/ui/pages/subscribe/subscribe.js';
import '/imports/ui/pages/my-subscriptions/my-subscriptions.js';
import '/imports/ui/pages/my-orders/my-orders.js';
import '/imports/ui/pages/packs/packs.js';
import '/imports/ui/pages/gift-cards/gift-cards.js';
import '/imports/ui/pages/equinox-join/equinox-join.js';
import '/imports/ui/pages/dean-street/dean-street.js';
import '/imports/ui/pages/jobs/jobs.js';
import '/imports/ui/pages/media/media.js';

// Import admin templates
import '/imports/ui/layouts/admin-layout/admin-layout.js';
import '/imports/ui/pages/main-admin/main-admin.js';
import '/imports/ui/pages/menu-admin/menu-admin.js';
import '/imports/ui/pages/orders-admin/orders-admin.js';
import '/imports/ui/pages/customers-admin/customers-admin.js';
import '/imports/ui/pages/customer-detail/customer-detail.js';
import '/imports/ui/pages/subscribers-admin/subscribers-admin.js';
import '/imports/ui/pages/promos-admin/promos-admin.js';

// Import to override accounts templates
import '/imports/ui/accounts/accounts-templates/accounts-templates.js';
import '/imports/ui/accounts/signup/signup.js';

// Import wiki templates
import '/imports/ui/wiki/index.js';

// Import test template
import '/imports/ui/pages/test/test.js';




import { Vue } from 'meteor/akryum:vue';
import { $ } from 'meteor/jquery';

import Layout from '/imports/ui/layouts/base-layout/vue-base.vue';

$('body').append('<div id="_vue_root"></div>');
// Add an element on body for Vue to mount.
// Of course you can use direct DOM operations there to avoid jQuery.
Meteor.vueVm = new Vue({ // Attach vm to Meteor, in case we need it elsewhere.
  el: '#_vue_root',
  render(createElement) {
    return createElement(Layout, { attrs: { type: this.type, layout: this.layout, body: this.body } });
  },
  // The render function above acts as:
  // <layout :type="type" :body="body"></layout>
  data: () => ({ type: '', body: '' }),
  components: { Layout },
});
const render = (type, layout, body) => { // In place of BlazeLayout.render
  Meteor.vueVm.type = type;
  Meteor.vueVm.layout = layout;
  Meteor.vueVm.body = body;
};


mainRoutes.map(({route, name, layout, template}) =>
  FlowRouter.route(route, {
    name,
    action() {
      render("blaze", layout, template)
    },
  }));

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    render("blaze", mainNotFound.layout, mainNotFound.template)
  },
};

var flowAdminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  // triggersEnter: [function(context, redirect) {
  //   console.log('running group triggers');
  // }]
});

adminRoutes.map(({route, name, layout, template}) =>
  flowAdminRoutes.route(route, {
    name,
    action() {
      render("blaze", layout, template)
    },
  }));

FlowRouter.route( '/verify-email/:token', {
  name: 'verify-email',
  action( params ) {
    Accounts.verifyEmail( params.token, ( error ) =>{
      if ( error ) {
        sAlert.error( error.reason );
      } else {
        FlowRouter.go( '/' );
        sAlert.success( 'Email verified! Welcome to Fed!');
      }
    });
  }
});

AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/signin',
  template: 'SignIn'
});

AccountsTemplates.configureRoute('signUp', {
  name: 'join',
  path: '/join',
  template: 'SignUp'
});

AccountsTemplates.configureRoute('forgotPwd', {
  name: 'forgotPwd',
  path: '/forgot-password',
  template: 'Forgot_password',
});

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
});
