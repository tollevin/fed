export const mainRoutes = [
  {
    route: '/',
    name: 'App.home',
    layout: 'App_body',
    template: 'Landing_page',
  },
  {
    route: '/my-account',
    name: 'User.home',
    layout: 'App_body',
    template: 'User_home',
  },
  {
    route: '/packs',
    name: 'Packs',
    layout: 'App_body',
    template: 'Packs',
  },
  {
    route: '/menu',
    name: 'Menu.show',
    layout: 'App_body',
    template: 'Menu_page',
  },
  {
    route: '/market',
    name: 'Market',
    layout: 'App_body',
    template: 'Market_page',
  },
  {
    route: '/about-us',
    name: 'About.us',
    layout: 'App_body',
    template: 'About_page',
  },
  {
    route: '/confirmation',
    name: 'Confirmation',
    layout: 'App_body',
    template: 'Confirmation',
  },
  {
    route: '/settings',
    name: 'Account.settings',
    layout: 'App_body',
    template: 'Account_page',
  },
  {
    route: '/subscribe',
    name: 'Subscribe',
    layout: 'App_body',
    template: 'Subscribe',
  },
  {
    route: '/subscriptions',
    name: 'My.subscriptions',
    layout: 'App_body',
    template: 'My_Subscriptions',
  },
  {
    route: '/orders',
    name: 'My.orders',
    layout: 'App_body',
    template: 'My_Orders',
  },
  {
    route: '/gifts',
    name: 'Gifts',
    layout: 'App_body',
    template: 'Gift_Cards',
  },
  {
    route: '/blog',
    name: 'Blog.roll',
    layout: 'App_body',
    template: 'Blog_page',
  },
  {
    route: '/menu/:_id',
    name: 'Item.show',
    layout: 'App_body',
    template: 'Item_detail',
  },
  {
    route: '/support',
    name: 'Support',
    layout: 'App_body',
    template: 'Support_page',
  },
  {
    route: '/checkout',
    name: 'Checkout',
    layout: 'App_body',
    template: 'Checkout_page',
  },
  {
    route: '/success',
    name: 'Success',
    layout: 'App_body',
    template: 'Success_page',
  },
  {
    route: '/redeem',
    name: 'redeem',
    layout: 'App_body',
    template: 'Success_page', // 2 success pages?
  },
  {
    route: '/jobs',
    name: 'Jobs',
    layout: 'App_body',
    template: 'Jobs',
  },
  {
    route: '/media',
    name: 'Media',
    layout: 'App_body',
    template: 'Media',
  },
  {
    route: '/test',
    name: 'Test',
    layout: 'App_body',
    template: 'Test',
  },
  {
    route: '/equinox',
    name: 'Equinox.join',
    layout: 'App_body',
    template: 'Equinox_join',
  },
  {
    route: '/deanstreet',
    name: 'DeanStreet',
    layout: 'App_body',
    template: 'DeanStreet',
  },
];

export const mainNotFound = {
  layout: 'App_body',
  template: 'App_notFound',
};

export const adminRoutes = [
  {
    route: '/',
    name: 'Main.admin',
    layout: 'Admin_layout',
    template: 'Main_admin',
  },
  {
    route: '/menu',
    name: 'Menu.admin',
    layout: 'Admin_layout',
    template: 'Menu_admin',
  },
  {
    route: '/orders',
    name: 'Orders.admin',
    layout: 'Admin_layout',
    template: 'Orders_admin',
  },
  {
    route: '/customers',
    name: 'Customers.admin',
    layout: 'Admin_layout',
    template: 'Customers_admin',
  },
  {
    route: '/customers/:_id',
    name: 'Customer.detail',
    layout: 'Admin_layout',
    template: 'Customer_detail',
  },
  {
    route: '/subscribers',
    name: 'Subscribers.admin',
    layout: 'Admin_layout',
    template: 'Subscribers_admin',
  },
  {
    route: '/promos',
    name: 'Promos.admin',
    layout: 'Admin_layout',
    template: 'Promos_admin',
  },
  {
    route: '/specs',
    name: 'Wiki.Index',
    layout: 'Admin_layout',
    template: 'Wiki_index',
  },
];
