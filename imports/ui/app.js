import 'isomorphic-fetch'

import { Router, routes } from '/imports/ui/routes.js'
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { lodash } from 'meteor/erasaur:meteor-lodash';
import Vue from 'vue';
import Meta from 'vue-meta'
import VueRouter from 'vue-router'
import VueMeteorTracker from 'vue-meteor-tracker'

import App from '/imports/ui/layouts/base-layout/App.vue';
import { $ } from 'meteor/jquery';

Vue.use(VueRouter)
Vue.use(Meta)
Vue.use(VueMeteorTracker)


// Import user templates

console.log("App = %j", App);

export default createApp = () => {
  const router = new VueRouter({ mode: 'history', routes });
  if(Meteor.isClient) $('body').append('<div id="_vue_root"></div>');
  // Add an element on body for Vue to mount.
  // Of course you can use direct DOM operations there to avoid jQuery.
  Meteor.router = router;
  Meteor.vueVm = new Vue({ // Attach vm to Meteor, in case we need it elsewhere.
    el: '#_vue_root',
    router,
    ...App
  });

  return ({
    app: Meteor.vueVm,
    router,
  });
}

