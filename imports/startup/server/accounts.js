import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr'; 

// Menus collection
import { Items } from '../../api/items/items.js';

Meteor.methods({

  updateUser (user, data) {

    const updated = Meteor.users.update({ _id: user }, {
      $set: data,
    });

    return (Meteor.users.findOne({ _id: user }));
  },

  createSubscriber (user) {
    // Called only from the Trial_signup component when someone is subscribing but not yet a user

    const customer = { 
      email: user.email, 
      password: user.password 
    };

    const _id = Accounts.createUser(customer);
      
    Accounts.sendVerificationEmail(_id, user.email, ( error ) => {
      if ( error ) {
        console.log(error.reason);
        return (error);
      };
    });

    Meteor.users.update({ _id: _id }, {
      $set: {
        "address_zipcode": user.zipCode,
      },
    });

    return _id;
  },

  updateSubscriber (user, data) {

    const updated = Meteor.users.update({ _id: user }, {
      $set: data,
    });

    SSR.compileTemplate('htmlEmail', Assets.getText('new-subscriber.html'));

    Template.htmlEmail.helpers({
      doctype() {
        return '<!DOCTYPE HTML>'
      }
    });

    var emailData = data;
    emailData.thisWeeksMenuItems = Items.find({ "active": true }).fetch();

    Email.send({
      to: data.email,
      bcc: "info@getfednyc.com",
      from: "no-reply@getfednyc.com",
      subject: "You're Subscribed!",
      html: SSR.render('htmlEmail', emailData),
    });

    return(Meteor.user());
  },

  referSubscriber (user) {
    // Called only from the Trial_signup component when someone is subscribing but not yet a user

    const customer = { 
      email: user.email, 
      password: user.password,
    };

    const _id = Accounts.createUser(customer);
      
    Accounts.sendVerificationEmail(_id, user.email, ( error ) => {
      if ( error ) {
        console.log(error.reason);
        return (error);
      };
    });

    Meteor.users.update({ _id: _id }, {
      $set: {
        "address_zipcode": user.zipCode,
        "referrer": user.referrer
      },
    });

    return _id;
  },

  checkUserHasPurchased (email) {

    const exists = Meteor.users.findOne({ "emails.address": email });
    
    if (exists && exists.last_purchase) {
      return true;
    } else {
      return false;
    };
  },

  updatePassword () {
    Accounts.setPassword("nKRge2f39ddQhH4Dc", "joem123");
  },
});

Meteor.publish("limitedUserData", function() { 
  return Meteor.users.find({ _id: this.userId }, { fields: {'_id':1,'first_name':1,'last_name':1,'emails':1,'address_zipcode':1,'diet':1,'restrictions':1,'subscriptions':1, 'last_purchase': 1}}); 
});

Meteor.publish("someUserData", function() { 
  return Meteor.users.find({ _id: this.userId }, { fields: {'_id':1,'first_name':1,'last_name':1,'emails':1,'email':1,'address_zipcode':1,'deliv_comments':1,'amount_spent':1,'credit':1,'last_purchase':1,'diet':1, 'plan':1, 'stripe_id':1,'preferredDelivDay':1,'subscriptions':1,'skipping':1,'profile':1}}); 
});

Meteor.publish("thisUserData", function(id) {
  if (id) {
    return Meteor.users.find({ _id: id }, { fields: {'_id':1,'first_name':1,'last_name':1,'phone':1,'emails':1,'email':1,'address_line_1':1,'address_line_2':1,'address_city':1,'address_state':1,'address_zipcode':1,'deliv_window':1,'deliv_comments':1,'amount_spent':1,'credit':1,'last_purchase':1,'diet':1,'plan':1,'coupon':1,'restrictions':1, 'stripe_id':1,'preferredDelivDay':1,'subscriptions':1,'skipping':1,'referrer':1,'profile':1}}); 
  } else {
    return Meteor.users.find({ _id: this.userId }, { fields: {'_id':1,'first_name':1,'last_name':1,'phone':1,'emails':1,'email':1,'address_line_1':1,'address_line_2':1,'address_city':1,'address_state':1,'address_zipcode':1,'deliv_window':1,'deliv_comments':1,'amount_spent':1,'credit':1,'last_purchase':1,'diet':1,'plan':1,'coupon':1,'restrictions':1,'stripe_id':1,'preferredDelivDay':1,'subscriptions':1,'skipping':1,'referrer':1,'profile':1}}); 
  };
});

Meteor.publish("userData", function() { 
  return Meteor.users.find({}, { fields: {'_id':1,'createdAt':1,'first_name':1,'last_name':1,'phone':1,'emails':1,'email':1,'address_line_1':1,'address_line_2':1,'address_city':1,'address_state':1,'address_zipcode':1,'deliv_window':1,'deliv_comments':1,'amount_spent':1,'credit':1,'last_purchase':1,'diet':1,'plan':1,'restrictions':1,'coupon':1,'stripe_id':1,'preferredDelivDay':1,'subscriptions':1,'skipping':1,'referrer':1,'profile':1}}); 
});