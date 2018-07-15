import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { lodash } from 'meteor/erasaur:meteor-lodash';

// Import user templates

import { mainRoutes, mainNotFound, adminRoutes } from '/imports/ui/routes.js';

import '/imports/ui/layouts/app-body/app-body.js';
import '/imports/ui/layouts/admin-layout/admin-layout.js';

// Import to override accounts templates
import '/imports/ui/accounts/accounts-templates/accounts-templates.js';


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

mainRoutes.map(({
  route, name, layout, template, importStr
}) => FlowRouter.route(route, {
  name,
  waitOn: () => {
    console.log("importStr = %j", importStr);
    return importStr ? import(importStr) : undefined;
  },
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

const flowAdminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  // triggersEnter: [function(context, redirect) {
  //   console.log('running group triggers');
  // }]
});

adminRoutes.map(({
  route, name, layout, template, importStr,
}) => flowAdminRoutes.route(route, {
  name,
  waitOn: () => {
    console.log("importStr = %j", importStr);
    return importStr ? import(importStr) : undefined;
  },
  action() {
    BlazeLayout.render(layout, { main: template });
  },
}));

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
