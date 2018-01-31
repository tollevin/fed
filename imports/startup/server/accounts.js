import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr'; 

import { makeGiftCardCode } from '../../utils/codify.js';

// Menus collection
import { Items } from '../../api/items/items.js';
import { Promos } from '../../api/promos/promos.js';
import { insertPromo } from '../../api/promos/methods.js';

Meteor.methods({

  async updateUser(user_id, data) {
    try {
      const user = Meteor.users.findOne({ _id: user_id });

      const updated = Meteor.users.update({ _id: user_id }, {
        $set: data,
      });

      var creditUpdated = (user.credit != data.credit) && ('Updating credit for ' + user.first_name + ' ' + user.last_name + ': $' + user.credit + ' to $' + data.credit); 
      if (creditUpdated) {
        console.log(creditUpdated);
      };

      if (data.credit) {
        const args = {
          id: user.stripe_id,
          account_balance: data.credit,
        };

        Meteor.call('updateStripeCredit', args);
      };

      return (Meteor.users.findOne({ _id: user_id }));
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  async createSubscriber ( user ) {
    // Called only when someone is subscribing but not yet a user
    try {
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
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  async updateSubscriber (user, data) {
    try {
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
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  async sendOrderConfirmationEmail(user_id,data) {
    try {
      const user = Meteor.users.findOne({ _id: user_id });
      SSR.compileTemplate('htmlEmail', Assets.getText('order-confirmation-email.html'));

      Template.htmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>'
        },

        userFirstName() {
          const username = user.first_name;
          return username;
        },
      });

      var emailData = data;
      emailData.email = user.emails[0].address;
      emailData.packItems = [];
      for (var i = emailData.packDishes.length - 1; i >= 0; i--) {
        emailData.packItems[i] = Items.findOne({name: emailData.packDishes[i]});
      };

      const now = new moment();

      if (emailData.deliv_day[0].toLowerCase() === "s") {
        emailData.deliveryInfo = now.day(7).format("ddd DD MMM");
      } else {
        emailData.deliveryInfo = now.day(8).format("ddd DD MMM"); 
      };

      Email.send({
        to: emailData.email,
        bcc: "info@getfednyc.com",
        from: "no-reply@getfednyc.com",
        subject: "Your custom order with Fed",
        html: SSR.render('htmlEmail', emailData),
      });

      return true;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  async sendGiftCard (giftCard) {
    try {
      SSR.compileTemplate('giftCardHtmlEmail', Assets.getText('gift-card-email.html'));

      Template.giftCardHtmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>'
        },

        amountString(inCents) {
          return (inCents/100).toFixed(2);
        },
      });

      var emailData = giftCard;
      emailData.code = makeGiftCardCode();

      const promo = {
        codes: [emailData.code],
        desc: 'Fed Gift Card for ' + giftCard.recipient.first_name + ' ' + giftCard.recipient.last_name,
        credit: giftCard.value / 100,
        useLimitPerCustomer: 1,
        useLimitTotal: 1,
        timesUsed: 0,
        active: true,
      };

      const newPromo = insertPromo.call( promo );

      Email.send({
        to: giftCard.recipient.email,
        bcc: "info@getfednyc.com",
        from: "no-reply@getfednyc.com",
        subject: giftCard.customer.first_name + " sent you a Fed Gift Card!",
        html: SSR.render('giftCardHtmlEmail', emailData),
      });

      return emailData.code;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  // sendBackendGiftCard () {
  //   SSR.compileTemplate('giftCardHtmlEmail', Assets.getText('gift-card-email.html'));

  //   Template.giftCardHtmlEmail.helpers({
  //     doctype() {
  //       return '<!DOCTYPE HTML>'
  //     },

  //     amountString(inCents) {
  //       return (inCents/100).toFixed(2);
  //     },
  //   });

  //   var emailData = {
  //     customer: {
  //       first_name: ,
  //       last_name: ,
  //       email: ,
  //     },
  //     recipient: {
  //       first_name: ,
  //       last_name: ,
  //       email: ,
  //     },
  //     value: , // in cents
  //     message: ,
  //   };

  //   emailData.code = makeGiftCardCode();

  //   const promo = {
  //     codes: [emailData.code],
  //     desc: 'Fed Gift Card for ' + giftCard.recipient.first_name + ' ' + giftCard.recipient.last_name,
  //     credit: giftCard.value / 100,
  //     useLimitPerCustomer: 1,
  //     useLimitTotal: 1,
  //     timesUsed: 0,
  //     active: true,
  //   };

  //   const newPromo = insertPromo.call( promo );

  //   Email.send({
  //     to: giftCard.recipient.email,
  //     bcc: "info@getfednyc.com",
  //     from: "no-reply@getfednyc.com",
  //     subject: giftCard.customer.first_name + " sent you a Fed Gift Card!",
  //     html: SSR.render('giftCardHtmlEmail', emailData),
  //   });

  //   return emailData.code;
  // },

  async referSubscriber (user) {
    // Called only from the Trial_signup component when someone is subscribing but not yet a user
    try {
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
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  async checkUserHasPurchased (email) {
    try {
      const exists = Meteor.users.findOne({ "emails.address": email });
      
      if (exists && exists.last_purchase) {
        return true;
      } else {
        return false;
      };
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    };
  },

  // updatePassword () {
  //   Accounts.setPassword("nKRge2f39ddQhH4Dc", "joem123");
  // },
});

Meteor.publish("limitedUserData", function() { 
  return Meteor.users.find({
    _id: this.userId
  }, {
    fields: {
      '_id':1,
      'first_name':1,
      'last_name':1,
      'emails':1,
      'address_zipcode':1,
      'diet':1,
      'restrictions':1,
      'subscriptions':1,
      'last_purchase': 1
    }
  }); 
});

Meteor.publish("someUserData", function() { 
  return Meteor.users.find({ 
    _id: this.userId 
  }, { 
    fields: {
      '_id':1,
      'first_name':1,
      'last_name':1,
      'emails':1,
      'email':1,
      'address_zipcode':1,
      'deliv_comments':1,
      'amount_spent':1,
      'credit':1,
      'last_purchase':1,
      'diet':1,
       'plan':1,
       'stripe_id':1,
      'preferredDelivDay':1,
      'subscriptions':1,
      'skipping':1,
      'profile':1
    }
  }); 
});

Meteor.publish("thisUserData", function(id) {
  if (id) {
    return Meteor.users.find({
     _id: id,
    }, { 
      fields: {
        '_id':1,
        'first_name':1,
        'last_name':1,
        'phone':1,
        'emails':1,
        'email':1,
        'address_line_1':1,
        'address_line_2':1,
        'address_city':1,
        'address_state':1,
        'address_zipcode':1,
        'deliv_window':1,
        'deliv_comments':1,
        'amount_spent':1,
        'credit':1,
        'last_purchase':1,
        'diet':1,
        'plan':1,
        'coupon':1,
        'restrictions':1,
        'stripe_id':1,
        'preferredDelivDay':1,
        'subscriptions':1,
        'skipping':1,
        'referrer':1,
        'profile':1,
        'customized': 1
      }
    }); 
  } else {
    return Meteor.users.find({ 
      _id: this.userId 
    }, { 
      fields: {
        '_id':1,
        'first_name':1,
        'last_name':1,
        'phone':1,
        'emails':1,
        'email':1,
        'address_line_1':1,
        'address_line_2':1,
        'address_city':1,
        'address_state':1,
        'address_zipcode':1,
        'deliv_window':1,
        'deliv_comments':1,
        'amount_spent':1,
        'credit':1,
        'last_purchase':1,
        'diet':1,
        'plan':1,
        'coupon':1,
        'restrictions':1,
        'stripe_id':1,
        'preferredDelivDay':1,
        'subscriptions':1,
        'skipping':1,
        'referrer':1,
        'profile':1,
        'customized': 1
      }
    }); 
  };
});

Meteor.publish("userData", function(limit) { 
  if (limit) {
    return Meteor.users.find({}, {
      fields: {
        '_id':1,
        'createdAt':1,
        'first_name':1,
        'last_name':1,
        'phone':1,
        'emails':1,
        'email':1,
        'address_line_1':1,
        'address_line_2':1,
        'address_city':1,
        'address_state':1,
        'address_zipcode':1,
        'deliv_window':1,
        'deliv_comments':1,
        'amount_spent':1,
        'credit':1,
        'last_purchase':1,
        'diet':1,
        'plan':1,
        'restrictions':1,
        'coupon':1,
        'stripe_id':1,
        'preferredDelivDay':1,
        'subscriptions':1,
        'skipping':1,
        'referrer':1,
        'profile':1,
        'customized': 1
      },
      limit: limit,
    });
  } else {
    return Meteor.users.find({}, {
      fields: {
        '_id':1,
        'createdAt':1,
        'first_name':1,
        'last_name':1,
        'phone':1,
        'emails':1,
        'email':1,
        'address_line_1':1,
        'address_line_2':1,
        'address_city':1,
        'address_state':1,
        'address_zipcode':1,
        'deliv_window':1,
        'deliv_comments':1,
        'amount_spent':1,
        'credit':1,
        'last_purchase':1,
        'diet':1,
        'plan':1,
        'restrictions':1,
        'coupon':1,
        'stripe_id':1,
        'preferredDelivDay':1,
        'subscriptions':1,
        'skipping':1,
        'referrer':1,
        'profile':1,
        'customized': 1
      },
    });
  } ;
});

Meteor.publish("newestUsers", function(limit) { 
  new SimpleSchema({
    limit: { type: Number }
  }).validate({ limit });

  const options = {
    fields: {
      '_id':1,
      'createdAt':1,
      'first_name':1,
      'last_name':1,
      'phone':1,
      'emails':1,
      'email':1,
      'address_line_1':1,
      'address_line_2':1,
      'address_city':1,
      'address_state':1,
      'address_zipcode':1,
      'deliv_window':1,
      'deliv_comments':1,
      'amount_spent':1,
      'credit':1,
      'last_purchase':1,
      'diet':1,
      'plan':1,
      'restrictions':1,
      'coupon':1,
      'stripe_id':1,
      'preferredDelivDay':1,
      'subscriptions':1,
      'skipping':1,
      'referrer':1,
      'profile':1,
      'customized': 1
    },
    limit: limit,
    sort: {createdAt: -1},
  };

  return Meteor.users.find({}, options);
});

Meteor.publish("subscriberData", function() {
  const options = {
    fields: {
      '_id':1,
      'createdAt':1,
      'first_name':1,
      'last_name':1,
      'phone':1,
      'emails':1,
      'email':1,
      'address_line_1':1,
      'address_line_2':1,
      'address_city':1,
      'address_state':1,
      'address_zipcode':1,
      'deliv_window':1,
      'deliv_comments':1,
      'amount_spent':1,
      'credit':1,
      'last_purchase':1,
      'diet':1,
      'plan':1,
      'restrictions':1,
      'coupon':1,
      'stripe_id':1,
      'preferredDelivDay':1,
      'subscriptions':1,
      'skipping':1,
      'referrer':1,
      'profile':1,
      'notes':1,
      'customized':1,
    },
  };

  return Meteor.users.find({"subscriptions.quantity": { $gt: 0 }}, options);
});

Meteor.publish("userSearchData", function() { 
  const options = {
    fields: {
      'first_name':1,
      'last_name':1,
      'phone':1,
      'emails':1,
      'address_zipcode':1,
    },
  };

  return Meteor.users.find({}, options);
});