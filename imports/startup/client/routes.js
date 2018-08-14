import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Accounts } from 'meteor/accounts-base';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { addTriggers } from './routeTriggers';

// Import user templates

import '/imports/ui/layouts/app-body/app-body.js';
import '/imports/ui/layouts/admin-layout/admin-layout.js';

// Import to override accounts templates
import '/imports/ui/accounts/accounts-templates/accounts-templates.js';

addTriggers(FlowRouter);

FlowRouter.route('/', {
  name: 'App.home',
  waitOn: () => import('/imports/ui/pages/landing-page/landing-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Landing_page' }),
});

FlowRouter.route('/my-account', {
  name: 'User.home',
  waitOn: () => import('/imports/ui/pages/user-home/user-home.js'),
  action: () => BlazeLayout.render('App_body', { main: 'User_home' }),
});

FlowRouter.route('/menu', {
  name: 'Menu.show',
  waitOn: () => import('/imports/ui/pages/menu-page/menu-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Menu_page' }),
});

FlowRouter.route('/about-us', {
  name: 'About.us',
  waitOn: () => import('/imports/ui/pages/about-page/about-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'About_page' }),
});

FlowRouter.route('/confirmation', {
  name: 'Confirmation',
  waitOn: () => import('/imports/ui/pages/confirmation-page/confirmation-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Confirmation' }),
});

FlowRouter.route('/settings', {
  name: 'Account.settings',
  waitOn: () => import('/imports/ui/pages/account-page/account-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Account_page' }),
});

FlowRouter.route('/subscribe', {
  name: 'Subscribe',
  waitOn: () => import('/imports/ui/pages/subscribe/subscribe.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Subscribe' }),
});

FlowRouter.route('/subscriptions', {
  name: 'My.subscriptions',
  waitOn: () => import('/imports/ui/pages/my-subscriptions/my-subscriptions.js'),
  action: () => BlazeLayout.render('App_body', { main: 'My_Subscriptions' }),
});

FlowRouter.route('/orders', {
  name: 'My.orders',
  waitOn: () => import('/imports/ui/pages/my-orders/my-orders.js'),
  action: () => BlazeLayout.render('App_body', { main: 'My_Orders' }),
});

FlowRouter.route('/gifts', {
  name: 'Gifts',
  waitOn: () => import('/imports/ui/pages/gift-cards/gift-cards.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Gift_Cards' }),
});

FlowRouter.route('/blog', {
  name: 'Blog.roll',
  waitOn: () => import('/imports/ui/pages/blog-page/blog-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Blog_page' }),
});

FlowRouter.route('/menu/:_id', {
  name: 'Item.show',
  waitOn: () => import('/imports/ui/pages/item-detail/item-detail.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Item_detail' }),
});

FlowRouter.route('/support', {
  name: 'Support',
  waitOn: () => import('/imports/ui/pages/support/support.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Support_page' }),
});

FlowRouter.route('/checkout', {
  name: 'Checkout',
  waitOn: () => import('/imports/ui/pages/checkout-page/checkout-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Checkout_page' }),
});

FlowRouter.route('/success', {
  name: 'Success',
  waitOn: () => import('/imports/ui/pages/success/success.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Success_page' }),
});

FlowRouter.route('/redeem', {
  name: 'redeem',
  waitOn: () => import('/imports/ui/pages/success/success.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Success_page' }),
});

FlowRouter.route('/jobs', {
  name: 'Jobs',
  waitOn: () => import('/imports/ui/pages/jobs/jobs.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Jobs' }),
});

FlowRouter.route('/media', {
  name: 'Media',
  waitOn: () => import('/imports/ui/pages/media/media.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Media' }),
});

FlowRouter.route('/test', {
  name: 'Test',
  waitOn: () => import('/imports/ui/pages/test/test.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Test' }),
});

FlowRouter.route('/ambassadors', {
  name: 'Ambassadors',
  waitOn: () => import('/imports/ui/pages/ambassadors/ambassadors.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Ambassadors' }),
});

FlowRouter.route('/equinox', {
  name: 'Equinox.join',
  waitOn: () => import('/imports/ui/pages/equinox-join/equinox-join.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Equinox_join' }),
});

FlowRouter.route('/deanstreet', {
  name: 'DeanStreet',
  waitOn: () => import('/imports/ui/pages/dean-street/dean-street.js'),
  action: () => BlazeLayout.render('App_body', { main: 'DeanStreet' }),
});

FlowRouter.route('/primary', {
  name: 'Primary.join',
  waitOn: () => import('/imports/ui/pages/primary-join/primary-join.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Primary_join' }),
});

FlowRouter.route('/orangetheory', {
  name: 'OT.join',
  waitOn: () => import('/imports/ui/pages/ot-join/ot-join.js'),
  action: () => BlazeLayout.render('App_body', { main: 'OT_join' }),
});

const flowAdminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  // triggersEnter: [function(context, redirect) {
  //   console.log('running group triggers');
  // }]
});

flowAdminRoutes.route('/', {
  name: 'Main.admin',
  waitOn: () => import('/imports/ui/pages/main-admin/main-admin.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Main_admin' }),
});

flowAdminRoutes.route('/menu', {
  name: 'Menu.admin',
  waitOn: () => import('/imports/ui/pages/menu-admin/menu-admin.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Menu_admin' }),
});

flowAdminRoutes.route('/orders', {
  name: 'Orders.admin',
  waitOn: () => import('/imports/ui/pages/orders-admin/orders-admin.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Orders_admin' }),
});

flowAdminRoutes.route('/customers', {
  name: 'Customers.admin',
  waitOn: () => import('/imports/ui/pages/customers-admin/customers-admin.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Customers_admin' }),
});

flowAdminRoutes.route('/customers/:_id', {
  name: 'Customer.detail',
  waitOn: () => import('/imports/ui/pages/customer-detail/customer-detail.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Customer_detail' }),
});

flowAdminRoutes.route('/subscribers', {
  name: 'Subscribers.admin',
  waitOn: () => import('/imports/ui/pages/subscribers-admin/subscribers-admin.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Subscribers_admin' }),
});

flowAdminRoutes.route('/promos', {
  name: 'Promos.admin',
  waitOn: () => import('/imports/ui/pages/promos-admin/promos-admin.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Promos_admin' }),
});

flowAdminRoutes.route('/specs', {
  name: 'Wiki.Index',
  waitOn: () => import('/imports/ui/wiki/index.js'),
  action: () => BlazeLayout.render('Admin_layout', { main: 'Wiki_index' }),
});


FlowRouter.route('/verify-email/:token', {
  name: 'verify-email',
  action(params) {
    Accounts.verifyEmail(params.token, (error) => {
      if (error) {
        sAlert.error(error.reason);
      } else {
        FlowRouter.go('/');
        sAlert.success('Email verified! Welcome to Fed!');
      }
    });
  },
});

// TODO MAKE REAL REDIRECT FAILURE PAGE
FlowRouter.route('*', {
  name: 'notFound',
  waitOn: () => import('/imports/ui/pages/landing-page/landing-page.js'),
  action: () => BlazeLayout.render('App_body', { main: 'Landing_page' }),
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
