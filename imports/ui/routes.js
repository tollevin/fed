export const mainRoutes = [
  {
    route: "/",
    name: "App.home",
    layout: "Blaze_base",
    template: "Landing_page",
  },
  {
    route: "/my-account",
    name: "User.home",
    layout: "Blaze_base",
    template: "User_home",
  },
  {
    route: "/packs",
    name: "Packs",
    layout: "Blaze_base",
    template: "Packs",
  },
  {
    route: "/menu",
    name: "Menu.show",
    layout: "Blaze_base",
    template: "Menu_page",
  },
  {
    route: "/market",
    name: "Market",
    layout: "Blaze_base",
    template: "Market_page",
  },
  {
    route: "/about-us",
    name: "About.us",
    layout: "Blaze_base",
    template: "About_page",
  },
  {
    route: "/confirmation",
    name: "Confirmation",
    layout: "Blaze_base",
    template: "Confirmation",
  },
  {
    route: "/settings",
    name: "Account.settings",
    layout: "Blaze_base",
    template: "Account_page",
  },
  {
    route: "/subscribe",
    name: "Subscribe",
    layout: "Blaze_base",
    template: "Subscribe",
  },
  {
    route: "/subscriptions",
    name: "My.subscriptions",
    layout: "Blaze_base",
    template: "My_Subscriptions",
  },
  {
    route: "/orders",
    name: "My.orders",
    layout: "Blaze_base",
    template: "My_Orders",
  },
  {
    route: "/gifts",
    name: "Gifts",
    layout: "Blaze_base",
    template: "Gift_Cards",
  },
  {
    route: "/blog",
    name: "Blog.roll",
    layout: "Blaze_base",
    template: "Blog_page",
  },
  {
    route: "/menu/:_id",
    name: "Item.show",
    layout: "Blaze_base",
    template: "Item_detail",
  },
  {
    route: "/support",
    name: "Support",
    layout: "Blaze_base",
    template: "Support_page",
  },
  {
    route: "/checkout",
    name: "Checkout",
    layout: "Blaze_base",
    template: "Checkout_page",
  },
  {
    route: "/success",
    name: "Success",
    layout: "Blaze_base",
    template: "Success_page",
  },
  {
    route: "/redeem",
    name: "redeem",
    layout: "Blaze_base",
    template: "Success_page", // 2 success pages?
  },
  {
    route: "/jobs",
    name: "Jobs",
    layout: "Blaze_base",
    template: "Jobs",
  },
  {
    route: "/media",
    name: "Media",
    layout: "Blaze_base",
    template: "Media",
  },
  {
    route: "/test",
    name: "Test",
    layout: "Blaze_base",
    template: "Test",
  },
  {
    route: "/equinox",
    name: "Equinox.join",
    layout: "Blaze_base",
    template: "Equinox_join",
  },
  {
    route: "/deanstreet",
    name: "DeanStreet",
    layout: "Blaze_base",
    template: "DeanStreet",
  },
]

export const mainNotFound = {
  layout: "Blaze_base",
  template: "App_notFound",
};

export const adminRoutes = [
  {
    route: "/",
    name: "Main.admin",
    layout: "Admin_layout",
    template: "Main_admin",
  },
  {
    route: "/menu",
    name: "Menu.admin",
    layout: "Admin_layout",
    template: "Menu_admin",
  },
  {
    route: "/orders",
    name: "Orders.admin",
    layout: "Admin_layout",
    template: "Orders_admin",
  },
  {
    route: "/customers",
    name: "Customers.admin",
    layout: "Admin_layout",
    template: "Customers_admin",
  },
  {
    route: "/customers/:_id",
    name: "Customer.detail",
    layout: "Admin_layout",
    template: "Customer_detail",
  },
  {
    route: "/subscribers",
    name: "Subscribers.admin",
    layout: "Admin_layout",
    template: "Subscribers_admin",
  },
  {
    route: "/promos",
    name: "Promos.admin",
    layout: "Admin_layout",
    template: "Promos_admin",
  },
  {
    route: "/specs",
    name: "Wiki.Index",
    layout: "Admin_layout",
    template: "Wiki_index",
  },
];
