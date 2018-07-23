import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';

import { moment } from 'meteor/momentjs:moment';
import makeGiftCardCode from '/imports/utils/make_gift_card_code.js';

// Collections
import { Items } from '/imports/api/items/items.js';
import { Promos } from '/imports/api/promos/promos.js';
import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';


import { insertPromo } from '/imports/api/promos/methods.js';

Meteor.methods({

  async updateUser(user_id, data) {
    try {
      const user = Meteor.users.findOne({ _id: user_id });

      if (!data.credit) data.credit = 0;

      const updated = Meteor.users.update({ _id: user._id }, {
        $set: data,
      });

      const creditUpdated = (user.credit != data.credit) && (`Updating stripe credit for ${user_id}: ${user.first_name} ${user.last_name}: $${user.credit} to $${data.credit}`);
      if (creditUpdated) {
        console.log(creditUpdated);
      }

      if (creditUpdated) {
        const args = {
          id: user.stripe_id,
          account_balance: data.credit,
        };

        Meteor.call('updateStripeCredit', args);
      }

      return (Meteor.users.findOne({ _id: user_id }));
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async createSubscriber (user) {
    // Called only when someone is subscribing but not yet a user
    try {
      const customer = {
        email: user.email,
        password: user.password,
      };

      const _id = Accounts.createUser(customer);

      Accounts.sendVerificationEmail(_id, user.email, (error) => {
        if (error) {
          console.log(error.reason);
          return (error);
        }
      });

      Meteor.users.update({ _id }, {
        $set: {
          address_zipcode: user.zipCode,
        },
      });

      return _id;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async updateSubscriber (user, data) {
    try {
      const updated = Meteor.users.update({ _id: user }, {
        $set: data,
      });

      SSR.compileTemplate('htmlEmail', Assets.getText('new-subscriber.html'));

      Template.htmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>';
        },
      });

      const emailData = data;
      emailData.thisWeeksMenuItems = Items.find({ active: true }).fetch();

      Email.send({
        to: data.email,
        bcc: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: "You're Subscribed!",
        html: SSR.render('htmlEmail', emailData),
      });

      return (Meteor.user());
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async getUserSubscriptionItems(user_id) {
    try {
      const user = Meteor.users.findOne({ _id: user_id });
      const subscriptions = user.subscriptions;
      const items = [];

      for (let i = subscriptions.length - 1; i >= 0; i--) {
        const subItem = Items.findOne({ _id: subscriptions[i].item_id });
        items.push(subItem);
      }

      return items;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async cancelSubscription(user_id, sub_id) {
    try {
      const user = Meteor.users.findOne({ _id: user_id });
      const subscriptions = user.subscriptions;
      let past_subs = user.past_subscriptions;
      if (!past_subs) past_subs = [];
      let sub;

      for (let i = subscriptions.length - 1; i >= 0; i--) {
        if (subscriptions[i]._id === sub_id) {
          sub = subscriptions[i];
          sub.status = 'canceled';
          sub.canceled_at = moment.utc().toDate();
          subscriptions.splice(i, 1);
          past_subs.push(sub);
        }
      }

      if (sub) {
        const updated = Meteor.users.update({ _id: user._id }, {
          $set: {
            subscriptions,
            past_subscriptions: past_subs,
          },
        });
      }
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async sendOrderConfirmationEmail(user_id, data) {
    try {
      const user = Meteor.users.findOne({ _id: user_id });
      SSR.compileTemplate('htmlEmail', Assets.getText('order-confirmation-email.html'));

      Template.htmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>';
        },

        userFirstName() {
          const username = user.first_name;
          return username;
        },
      });

      const emailData = data;
      emailData.email = user.emails[0].address;

      const dw = DeliveryWindows.findOne({ _id: emailData.delivery_window_id });
      const endDate = moment(dw.delivery_start_time).add(3, 'hour'); // Set Delivery Windows to be 3 hours long
      // const dateToString = moment(dw.delivery_start_time).format("dddd, MMMM Do, h") + '-' + endDate.format("ha");
      const dateToString = moment(dw.delivery_start_time).format('dddd, MMMM Do,');

      emailData.deliveryInfo = dateToString;

      Email.send({
        to: emailData.email,
        bcc: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: 'Your custom order with Fed',
        html: SSR.render('htmlEmail', emailData),
      });

      return true;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async sendGiftCard (giftCard) {
    try {
      SSR.compileTemplate('giftCardHtmlEmail', Assets.getText('gift-card-email.html'));

      Template.giftCardHtmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>';
        },

        amountString(inCents) {
          return (inCents / 100).toFixed(2);
        },
      });

      const emailData = giftCard;
      emailData.code = makeGiftCardCode();

      const promo = {
        codes: [emailData.code],
        desc: `Fed Gift Card for ${giftCard.recipient.first_name} ${giftCard.recipient.last_name}`,
        credit: giftCard.value / 100,
        useLimitPerCustomer: 1,
        useLimitTotal: 1,
        timesUsed: 0,
        active: true,
      };

      const newPromo = insertPromo.call(promo);

      Email.send({
        to: giftCard.recipient.email,
        bcc: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: `${giftCard.customer.first_name} sent you a Fed Gift Card!`,
        html: SSR.render('giftCardHtmlEmail', emailData),
      });

      return emailData.code;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
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

  async referUser (user) {
    try {
      const customer = {
        email: user.email,
        password: user.password,
      };

      const _id = Accounts.createUser(customer);

      Accounts.sendVerificationEmail(_id, user.email, (error) => {
        if (error) {
          console.log(error.reason);
          return (error);
        }
      });

      Meteor.users.update({ _id }, {
        $set: {
          address_zipcode: user.zipCode,
          referrer: user.referrer,
        },
      });

      const emailData = {
        email: user.email,
      };

      switch (user.referrer) {
        case 'Equinox':
          emailData.subject = 'Your Get Fed Promotion From Equinox!';
          emailData.file = 'equinox20.html';
          break;
        case 'DeanStreet':
          emailData.subject = 'Your Get Fed Promotion From Dean Street Block Party!';
          emailData.file = 'deanstreet.html';
          break;
      }

      SSR.compileTemplate('htmlEmail', Assets.getText(emailData.file));

      Template.htmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>';
        },
      });

      Email.send({
        to: emailData.email,
        bcc: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: emailData.subject,
        html: SSR.render('htmlEmail', emailData),
      });

      return _id;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async checkUserHasPurchased (email) {
    try {
      const exists = Meteor.users.findOne({ 'emails.address': email });

      if (exists && exists.last_purchase) {
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  // updatePassword (id, key) {
  //   Accounts.setPassword(id, key);
  // },
});

Meteor.publish('limitedUserData', function() {
  return Meteor.users.find({
    _id: this.userId,
  }, {
    fields: {
      _id: 1,
      first_name: 1,
      last_name: 1,
      emails: 1,
      address_zipcode: 1,
      diet: 1,
      restrictions: 1,
      subscriptions: 1,
      last_purchase: 1,
    },
  });
});

Meteor.publish('someUserData', function() {
  return Meteor.users.find({
    _id: this.userId,
  }, {
    fields: {
      _id: 1,
      first_name: 1,
      last_name: 1,
      emails: 1,
      email: 1,
      address_zipcode: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      subscriptions: 1,
      skipping: 1,
      profile: 1,
    },
  });
});

Meteor.publish('thisUserData', function(id) {
  if (id) {
    return Meteor.users.find({
      _id: id,
    }, {
      fields: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        phone: 1,
        emails: 1,
        email: 1,
        address_line_1: 1,
        address_line_2: 1,
        address_city: 1,
        address_state: 1,
        address_zipcode: 1,
        deliv_window: 1,
        deliv_comments: 1,
        amount_spent: 1,
        credit: 1,
        last_purchase: 1,
        diet: 1,
        plan: 1,
        coupon: 1,
        restrictions: 1,
        stripe_id: 1,
        preferredDelivDay: 1,
        subscriptions: 1,
        skipping: 1,
        referrer: 1,
        profile: 1,
        customized: 1,
      },
    });
  }
  return Meteor.users.find({
    _id: this.userId,
  }, {
    fields: {
      _id: 1,
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      email: 1,
      address_line_1: 1,
      address_line_2: 1,
      address_city: 1,
      address_state: 1,
      address_zipcode: 1,
      deliv_window: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      coupon: 1,
      restrictions: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      subscriptions: 1,
      skipping: 1,
      referrer: 1,
      profile: 1,
      customized: 1,
    },
  });
});

Meteor.publish('userData', function(limit) {
  if (limit) {
    return Meteor.users.find({}, {
      fields: {
        _id: 1,
        createdAt: 1,
        first_name: 1,
        last_name: 1,
        phone: 1,
        emails: 1,
        email: 1,
        address_line_1: 1,
        address_line_2: 1,
        address_city: 1,
        address_state: 1,
        address_zipcode: 1,
        deliv_window: 1,
        deliv_comments: 1,
        amount_spent: 1,
        credit: 1,
        last_purchase: 1,
        diet: 1,
        plan: 1,
        restrictions: 1,
        coupon: 1,
        stripe_id: 1,
        preferredDelivDay: 1,
        subscriptions: 1,
        skipping: 1,
        referrer: 1,
        profile: 1,
        customized: 1,
      },
      limit,
    });
  }
  return Meteor.users.find({}, {
    fields: {
      _id: 1,
      createdAt: 1,
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      email: 1,
      address_line_1: 1,
      address_line_2: 1,
      address_city: 1,
      address_state: 1,
      address_zipcode: 1,
      deliv_window: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      restrictions: 1,
      coupon: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      subscriptions: 1,
      skipping: 1,
      referrer: 1,
      profile: 1,
      customized: 1,
    },
  });
});

Meteor.publish('newestUsers', function(limit) {
  new SimpleSchema({
    limit: { type: Number },
  }).validate({ limit });

  const options = {
    fields: {
      _id: 1,
      createdAt: 1,
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      email: 1,
      address_line_1: 1,
      address_line_2: 1,
      address_city: 1,
      address_state: 1,
      address_zipcode: 1,
      deliv_window: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      restrictions: 1,
      coupon: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      subscriptions: 1,
      skipping: 1,
      referrer: 1,
      profile: 1,
      customized: 1,
    },
    limit,
    sort: { createdAt: -1 },
  };

  return Meteor.users.find({}, options);
});

Meteor.publish('subscriberData', function() {
  const options = {
    fields: {
      _id: 1,
      createdAt: 1,
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      email: 1,
      address_line_1: 1,
      address_line_2: 1,
      address_city: 1,
      address_state: 1,
      address_zipcode: 1,
      deliv_window: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      restrictions: 1,
      coupon: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      preferred_deliv_windows: 1,
      subscriptions: 1,
      past_subscriptions: 1,
      skipping: 1,
      referrer: 1,
      profile: 1,
      notes: 1,
      customized: 1,
    },
  };

  return Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }, options);
});

Meteor.publish('subscriberFullData', function() {
  const options = {
    fields: {
      _id: 1,
      createdAt: 1,
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      email: 1,
      address_line_1: 1,
      address_line_2: 1,
      address_city: 1,
      address_state: 1,
      address_zipcode: 1,
      deliv_window: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      restrictions: 1,
      coupon: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      subscriptions: 1,
      past_subscriptions: 1,
      referrer: 1,
      profile: 1,
      notes: 1,
    },
  };

  return Meteor.users.find({ 'subscriptions.quantity': { $gt: 0 } }, options);
});

Meteor.publish('unsubscriberData', function() {
  const options = {
    fields: {
      _id: 1,
      createdAt: 1,
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      email: 1,
      address_line_1: 1,
      address_line_2: 1,
      address_city: 1,
      address_state: 1,
      address_zipcode: 1,
      deliv_window: 1,
      deliv_comments: 1,
      amount_spent: 1,
      credit: 1,
      last_purchase: 1,
      diet: 1,
      plan: 1,
      restrictions: 1,
      coupon: 1,
      stripe_id: 1,
      preferredDelivDay: 1,
      preferred_deliv_windows: 1,
      subscriptions: 1,
      past_subscriptions: 1,
      skipping: 1,
      referrer: 1,
      profile: 1,
      notes: 1,
      customized: 1,
    },
  };

  return Meteor.users.find({ 'past_subscriptions.0': { $exists: true }, 'subscriptions.0': { $exists: false } }, options);
});

Meteor.publish('userSearchData', function() {
  const options = {
    fields: {
      first_name: 1,
      last_name: 1,
      phone: 1,
      emails: 1,
      address_zipcode: 1,
    },
  };

  return Meteor.users.find({}, options);
});
