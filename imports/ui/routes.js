// import { FlowRouter } from 'meteor/kadira:flow-router';

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

import Layout from '/imports/ui/layouts/base-layout/vue-base.vue';



export default [
  {
    path: "/",
    name: "App.home",
    props: {
      layout: "App_body",
      template: "Landing_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/my-account",
    name: "User.home",
    props: {
      layout: "App_body",
      template: "User_home",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/packs",
    name: "Packs",
    props: {
      layout: "App_body",
      template: "Packs",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/menu",
    name: "Menu.show",
    props: {
      layout: "App_body",
      template: "Menu_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/market",
    name: "Market",
    props: {
      layout: "App_body",
      template: "Market_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/about-us",
    name: "About.us",
    props: {
      layout: "App_body",
      template: "About_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/confirmation",
    name: "Confirmation",
    props: {
      layout: "App_body",
      template: "Confirmation",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/settings",
    name: "Account.settings",
    props: {
      layout: "App_body",
      template: "Account_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/subscribe",
    name: "Subscribe",
    props: {
      layout: "App_body",
      template: "Subscribe",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/subscriptions",
    name: "My.subscriptions",
    props: {
      layout: "App_body",
      template: "My_Subscriptions",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/orders",
    name: "My.orders",
    props: {
      layout: "App_body",
      template: "My_Orders",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/gifts",
    name: "Gifts",
    props: {
      layout: "App_body",
      template: "Gift_Cards",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/blog",
    name: "Blog.roll",
    props: {
      layout: "App_body",
      template: "Blog_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/menu/:_id",
    name: "Item.show",
    props: {
      layout: "App_body",
      template: "Item_detail",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/support",
    name: "Support",
    props: {
      layout: "App_body",
      template: "Support_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/checkout",
    name: "Checkout",
    props: {
      layout: "App_body",
      template: "Checkout_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/success",
    name: "Success",
    props: {
      layout: "App_body",
      template: "Success_page",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/redeem",
    name: "redeem",
    props: {
      layout: "App_body",
      template: "Success_page", // 2 success pages?
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/jobs",
    name: "Jobs",
    props: {
      layout: "App_body",
      template: "Jobs",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/media",
    name: "Media",
    props: {
      layout: "App_body",
      template: "Media",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/test",
    name: "Test",
    props: {
      layout: "App_body",
      template: "Test",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/equinox",
    name: "Equinox.join",
    props: {
      layout: "App_body",
      template: "Equinox_join",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/deanstreet",
    name: "DeanStreet",
    props: {
      layout: "App_body",
      template: "DeanStreet",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/signin",
    name: "signIn",
    props: {
      layout: "App_body",
      template: "SignIn",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/join",
    name: "signUp",
    props: {
      layout: "App_body",
      template: "SignUp",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/forgot-password",
    name: "forgotPwd",
    props: {
      layout: "App_body",
      template: "Forgot_password",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin",
    name: "Main.admin",
    props: {
      layout: "Admin_layout",
      template: "Main_admin",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/menu",
    name: "Menu.admin",
    props: {
      layout: "Admin_layout",
      template: "Menu_admin",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/orders",
    name: "Orders.admin",
    props: {
      layout: "Admin_layout",
      template: "Orders_admin",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/customers",
    name: "Customers.admin",
    props: {
      layout: "Admin_layout",
      template: "Customers_admin",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/customers/:_id",
    name: "Customer.detail",
    props: {
      layout: "Admin_layout",
      template: "Customer_detail",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/subscribers",
    name: "Subscribers.admin",
    props: {
      layout: "Admin_layout",
      template: "Subscribers_admin",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/promos",
    name: "Promos.admin",
    props: {
      layout: "Admin_layout",
      template: "Promos_admin",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/admin/specs",
    name: "Wiki.Index",
    props: {
      layout: "Admin_layout",
      template: "Wiki_index",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "/verify-email/:token",
    name: 'verify-email',
    props: {
      layout: "Admin_layout",
      template: "Wiki_index",
      type: "blaze",
    },
    component: Layout
  },
  {
    path: "*",
    props: {
      layout: "App_body",
      template: "App_notFound",
      type: "blaze",
    },
    component: Layout
  },
];

export const Router = {
  go: (path, options) => {
    return undefined;
    // return FlowRouter.go(path, options)
  },
  path: (path, options) => {
    return undefined;
    // return FlowRouter.path(path, options)
  },
  setNotFound: (notFound) => {
    return undefined;
    // FlowRouter.notFound = notFound
  },
  group: (options) => {
    return undefined;
    // return FlowRouter.group(options)
  },
  getRouteName: () => {
    return Meteor.router.currentRoute.path;
    // return FlowRouter.getRouteName()
  },
  current: () => {
    return undefined;
    // return FlowRouter.current()
  },
  getParam: (param) => {
    return undefined;
    // return FlowRouter.getParam(param)
  },
};

/*
Router.path('/verify-email/:token', {
  name: 'verify-email',
  action( params ) {
    Accounts.verifyEmail( params.token, ( error ) =>{
      if ( error ) {
        sAlert.error( error.reason );
      } else {
        Router.go('/');
        sAlert.success( 'Email verified! Welcome to Fed!');
      }
    });
  }
});
*/

// AccountsTemplates.configureRoute('signIn', {
//   name: 'signin',
//   path: '/signin',
//   template: 'SignIn'
// });

// AccountsTemplates.configureRoute('signUp', {
//   name: 'join',
//   path: '/join',
//   template: 'SignUp'
// });

// AccountsTemplates.configureRoute('forgotPwd', {
//   name: 'forgotPwd',
//   path: '/forgot-password',
//   template: 'Forgot_password',
// });

// AccountsTemplates.configureRoute('resetPwd', {
//   name: 'resetPwd',
//   path: '/reset-password',
// });
