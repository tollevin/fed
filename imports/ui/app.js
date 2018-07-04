import 'isomorphic-fetch'

import { Router } from '/imports/ui/routes.js'
import routes from '/imports/ui/routes.js'
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { lodash } from 'meteor/erasaur:meteor-lodash';
import { Vue } from 'meteor/akryum:vue';
import { $ } from 'meteor/jquery';

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import VueMeteorTracker from 'vue-meteor-tracker'
Vue.use(VueMeteorTracker)

import App from '/imports/ui/layouts/base-layout/app.vue';

// Import user templates

export default createApp = () => {
  const router = new VueRouter({
    mode: 'history',
    routes,
  })

  $('body').append('<div id="_vue_root"></div>');
  // Add an element on body for Vue to mount.
  // Of course you can use direct DOM operations there to avoid jQuery.
  Meteor.router = router;
  Meteor.vueVm = new Vue({ // Attach vm to Meteor, in case we need it elsewhere.
    el: '#_vue_root',
    router,
    // The render function above acts as:
    // <layout :type="type" :body="body"></layout>
    ...App
  });

  return ({
    app: Meteor.vueVm,
    router,
  });
}

