import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { lodash } from 'meteor/erasaur:meteor-lodash';

// Import user templates

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
import '/imports/ui/pages/sign-up/sign-up.js';
import '/imports/ui/pages/equinox-join/equinox-join.js';
import '/imports/ui/pages/dean-street/dean-street.js';
import '/imports/ui/pages/jobs/jobs.js';
import '/imports/ui/pages/media/media.js';

// Import admin templates
import '/imports/ui/layouts/admin-body/admin-body.js';
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


FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Landing_page' });
  },
});

FlowRouter.route('/my-account', {
  name: 'User.home',
  action() {
    BlazeLayout.render('App_body', { main: 'User_home' });
  },
});

FlowRouter.route('/packs', {
  name: 'Packs',
  action() {
    BlazeLayout.render('App_body', { main: 'Packs' });
  },
});

FlowRouter.route('/menu', {
  name: 'Menu.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Menu_page' });
  },
});

FlowRouter.route('/market', {
  name: 'Market',
  action() {
    BlazeLayout.render('App_body', { main: 'Market_page' });
  },
});

FlowRouter.route('/about-us', {
  name: 'About.us',
  action() {
    BlazeLayout.render('App_body', { main: 'About_page' });
  },
});

FlowRouter.route('/confirmation', {
  name: 'Confirmation',
  action() {
    BlazeLayout.render('App_body', { main: 'Confirmation' });
  },
});

FlowRouter.route('/settings', {
  name: 'Account.settings',
  action() {
    BlazeLayout.render('App_body', { main: 'Account_page' });
  },
});

FlowRouter.route('/subscribe', {
  name: 'Subscribe',
  action() {
    BlazeLayout.render('App_body', { main: 'Subscribe' });
  },
});

FlowRouter.route('/subscriptions', {
  name: 'My.subscriptions',
  action() {
    BlazeLayout.render('App_body', { main: 'My_Subscriptions' });
  },
});

FlowRouter.route('/orders', {
  name: 'My.orders',
  action() {
    BlazeLayout.render('App_body', { main: 'My_Orders' });
  },
});

FlowRouter.route('/gifts', {
  name: 'Gifts',
  action() {
    BlazeLayout.render('App_body', { main: 'Gift_Cards' });
  },
});

FlowRouter.route('/blog', {
  name: 'Blog.roll',
  action() {
    BlazeLayout.render('App_body', { main: 'Blog_page' });
  },
});

FlowRouter.route('/menu/:_id', {
  name: 'Item.show',
  action() {
    BlazeLayout.render('App_body', { main: 'Item_detail' });
  },
});

FlowRouter.route('/support', {
  name: 'Support',
  action() {
    BlazeLayout.render('App_body', { main: 'Support_page' });
  },
});

FlowRouter.route('/checkout', {
  name: 'Checkout',
  action() {
    BlazeLayout.render('App_body', { main: 'Checkout_page' });
  },
});

FlowRouter.route('/success', {
  name: 'Success',
  action() {
    BlazeLayout.render('App_body', { main: 'Success_page' });
  },
});

FlowRouter.route('/redeem', {
  name: 'redeem',
  action() {
    BlazeLayout.render('App_body', { main: 'Success_page' });
  },
});

FlowRouter.route('/jobs', {
  name: 'Jobs',
  action() {
    BlazeLayout.render('App_body', { main: 'Jobs' });
  },
});

FlowRouter.route('/media', {
  name: 'Media',
  action() {
    BlazeLayout.render('App_body', { main: 'Media' });
  },
});

FlowRouter.route('/test', {
  name: 'Test',
  action() {
    BlazeLayout.render('App_body', { main: 'Test' });
  },
});

// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  // triggersEnter: [function(context, redirect) {
  //   console.log('running group triggers');
  // }]
});

adminRoutes.route('/', {
  name: 'Main.admin',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Main_admin' });
  },
});

adminRoutes.route('/menu', {
  name: 'Menu.admin',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Menu_admin' });
  },
});

adminRoutes.route('/orders', {
  name: 'Orders.admin',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Orders_admin' });
  },
});

adminRoutes.route('/customers', {
  name: 'Customers.admin',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Customers_admin' });
  },
});

adminRoutes.route('/customers/:_id', {
  name: 'Customer.detail',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Customer_detail' });
  },
});

adminRoutes.route('/subscribers', {
  name: 'Subscribers.admin',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Subscribers_admin' });
  },
});

adminRoutes.route('/promos', {
  name: 'Promos.admin',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Promos_admin' });
  },
});

adminRoutes.route('/specs', {
  name: 'Wiki.Index',
  action() {
    BlazeLayout.render('Admin_layout', { main: 'Wiki_index' });
  },
});

// FlowRouter.route('/signup', {
//   name: 'Sign.Up',
//   action() {
//     BlazeLayout.render('App_body', { main: 'Sign_up' });
//   },
// });

FlowRouter.route('/equinox', {
  name: 'Equinox.join',
  action() {
    BlazeLayout.render('App_body', { main: 'Equinox_join' });
  },
});

FlowRouter.route('/deanstreet', {
  name: 'DeanStreet',
  action() {
    BlazeLayout.render('App_body', { main: 'DeanStreet' });
  },
});

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

Accounts.onLogin(function(){
  const route = FlowRouter.current().route.name;
  var user = Meteor.user();
  let subs;

  if (user) subs = user.subscriptions;

  // const nonRedirect = ['Subscribe', 'Packs', 'Checkout'];
  if (route === 'signin') {
    FlowRouter.go('Menu.show');
  } else {
    if (subs && subs[0].status != 'canceled') {
      FlowRouter.go('User.home');
    };
  };
});

Accounts.onLogout(function(){
  Session.set('Order', undefined);
  Session.set('orderId', undefined);
  Session.set('newUser', undefined);
  Session.set('subscribed', undefined);
  Session.set('pack', undefined);
  Session.set('stage', undefined);
  
  FlowRouter.go('App.home')
});

// Accounts.onResetPasswordLink(function(token, done) {
//   Accounts.resetPassword(token, newPassword);
// })

