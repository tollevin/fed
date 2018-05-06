import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { lodash } from 'meteor/erasaur:meteor-lodash';

// Import user templates
import '../../ui/layouts/app-body.js';
import '../../ui/pages/landing-page.js';
import '../../ui/pages/menu-page.js';
import '../../ui/pages/about-page.js';
import '../../ui/pages/support.js';
import '../../ui/pages/blog-page.js';
import '../../ui/components/menu-item.js';
import '../../ui/pages/item-detail.js';
import '../../ui/pages/checkout.js';
import '../../ui/pages/success.js';
import '../../ui/pages/account-page.js';
import '../../ui/pages/subscribe.js';
import '../../ui/pages/my-subscriptions.js';
import '../../ui/pages/packs.js';
import '../../ui/pages/gift-cards.js';
import '../../ui/pages/sign-up.js';
import '../../ui/pages/jobs.js';
import '../../ui/pages/media.js';

// Import admin templates
import '../../ui/layouts/admin-body.js';
import '../../ui/layouts/admin-layout.js';
import '../../ui/pages/main-admin.js';
import '../../ui/pages/menu-admin.js';
import '../../ui/pages/orders-admin.js';
import '../../ui/pages/customers-admin.js';
import '../../ui/pages/customer-detail.js';
import '../../ui/pages/subscribers-admin.js';
import '../../ui/pages/promos-admin.js';

// Import to override accounts templates
import '../../ui/accounts/accounts-templates.js';
import '../../ui/accounts/signup.js';

// Import wiki templates
import '../../ui/wiki/index.js';

// Import test template
import '../../ui/pages/test.js';

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

FlowRouter.route('/about-us', {
  name: 'About.us',
  action() {
    BlazeLayout.render('App_body', { main: 'About_page' });
  },
});

FlowRouter.route('/my-account', {
  name: 'My.account',
  action() {
    BlazeLayout.render('App_body', { main: 'Account_page' });
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

FlowRouter.route('/signup', {
  name: 'Sign.Up',
  action() {
    BlazeLayout.render('App_body', { main: 'Sign_up' });
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
  // const nonRedirect = ['Subscribe', 'Packs', 'Checkout'];
  if (route === 'signin') {
    FlowRouter.go('Menu.show');
  };
});

Accounts.onLogout(function(){
  FlowRouter.go('App.home')
});

// Accounts.onResetPasswordLink(function(token, done) {
//   Accounts.resetPassword(token, newPassword);
// })

