import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
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

// Import wiki templates
import '/imports/ui/wiki/index.js';

// Import test template
import '/imports/ui/pages/test/test.js';

// we only need to keep history for two paths at once
// first path is what we need to check always
// var previousPaths = [null, null];

// function saveScrollPosition(context) {
//   var pathInfo = {
//     path: context.path,
//     scrollPosition: $('body').scrollTop()
//   };

//   // add a new path and remove the first path
//   // using as a queue
//   previousPaths.push(pathInfo);
//   previousPaths.shift();
// };

// function jumpToPrevScrollPosition(context) {
//   var path = context.path;
//   var scrollPosition = 0;
//   var prevPathInfo = previousPaths[0];
//   if(prevPathInfo && prevPathInfo.path === context.path) {
//     scrollPosition = prevPathInfo.scrollPosition;
//   }

//   if(scrollPosition === 0) {
//     // we can scroll right away since we don't need to wait for rendering
//     $('body').animate({scrollTop: scrollPosition}, 0);
//   } else {
//     // Now we need to wait a bit for blaze/react does rendering.
//     // We assume, there's subs-manager and we've previous page's data.
//     // Here 10 millis deley is a arbitary value with some testing.
//     setTimeout(function () {
//       $('body').animate({scrollTop: scrollPosition}, 0);
//     }, 10);
//   }
// };

// FlowRouter.triggers.exit([saveScrollPosition]);
// FlowRouter.triggers.enter([jumpToPrevScrollPosition]);

mainRoutes.map(({route, name, layout, template}) =>
  FlowRouter.route(route, {
    name,
    action() {
      BlazeLayout.render(layout, { main: template });
    },
  }));

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render(mainNotFound.layout, { main: mainNotFound.template });
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
      BlazeLayout.render(layout, { main: template });
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
});

AccountsTemplates.configureRoute('signUp', {
  name: 'join',
  path: '/join',
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
});
