import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';

export const onLoginFunction = () => {
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
};

const onLogoutFunction = () => {
  Accounts.onLogout(function(){
    Session.set('Order', undefined);
    Session.set('orderId', undefined);
    Session.set('newUser', undefined);
    Session.set('subscribed', undefined);
    Session.set('pack', undefined);
    Session.set('stage', undefined);
    
    FlowRouter.go('App.home')
  });
};

export const signin = ({email, password}, callback) =>
  Meteor.loginWithPassword(email, password, ( error ) => {
    if (callback) { callback(error); }
    if(!error) { onLoginFunction(); }
  });

export const signout = (callback) =>
  Meteor.logout((error) => {
    if(callback) { callback(error); }
    if(!error) { onLogoutFunction(); }
  });
