/* eslint no-undef: [0, "Template"] */
// need the above because of the new router ostrio:flow-router-meta
// https://github.com/meteor/meteor/issues/9570
// TODO fix

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
// import { Template } from 'meteor/templating';
import { SSR } from 'meteor/meteorhacks:ssr';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
// import { check, Match } from 'meteor/check';

import { moment } from 'meteor/momentjs:moment';
import makeGiftCardCode from '/imports/utils/make_gift_card_code.js';
import { makeAmbassadorPromo } from '/imports/utils/make_promo.js';

// Collections
import { Items } from '/imports/api/items/items.js';
import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';
import { insertPromo } from '/imports/api/promos/methods.js';

export const sendGiftToUserViaEmail = ({
  recipientEmail,
  value,
  code,
  customerFirstName,
  message,
  cardType,
}) => {
  const emailData = {
    value,
    code,
    customer: { first_name: customerFirstName },
    message,
    cardType,
  };

  SSR.compileTemplate('giftCardHtmlEmail', Assets.getText('gift-card-email.html'));

  Template.giftCardHtmlEmail.helpers({
    doctype() {
      return '<!DOCTYPE HTML>';
    },

    amountString(inCents) {
      return (inCents / 100).toFixed(2);
    },
  });

  Email.send({
    to: recipientEmail,
    bcc: 'info@getfednyc.com',
    from: 'no-reply@getfednyc.com',
    subject: `${customerFirstName} sent you a Fed Gift Card!`,
    html: SSR.render('giftCardHtmlEmail', emailData),
  });
};

Meteor.methods({
  async sendGiftToUserViaEmail(...args) {
    sendGiftToUserViaEmail(...args);
  },
  async updateUser(userId, data) {
    // check(userId, String);
    // check(data, { credit: Number });
    try {
      const user = Meteor.users.findOne({ _id: userId });
      const cleanCredit = { ...data, credit: data.credit || 0 };

      Meteor.users.update({ _id: user._id }, { $set: cleanCredit });

      if (user.stripe_id) {
        const args = {
          id: user.stripe_id,
          account_balance: cleanCredit.credit,
        };

        Meteor.call('updateStripeCredit', args);
      }

      return (Meteor.users.findOne({ _id: userId }));
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async createSubscriber(user) {
    // check(user, {
    //   email: String,
    //   password: String,
    //   zipCode: String,
    // });

    const { email, password, zipCode } = user;

    // Called only when someone is subscribing but not yet a user
    try {
      const customer = { email, password };

      const _id = Accounts.createUser(customer);

      Accounts.sendVerificationEmail(_id, email, (error) => {
        if (error) { return (error); }
        return undefined;
      });

      Meteor.users.update({ _id }, { $set: { address_zipcode: zipCode } });

      return _id;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async updateSubscriber(userId, data) {
    // check(userId, String);
    // check(data, { email: String });

    try {
      Meteor.users.update({ _id: userId }, {
        $set: data,
      });

      SSR.compileTemplate('htmlEmail', Assets.getText('new-subscriber.html'));

      Template.htmlEmail.helpers({
        doctype() {
          return '<!DOCTYPE HTML>';
        },
      });

      const emailData = {
        ...data,
        thisWeeksMenuItems: Items.find({ active: true }).fetch(),
      };

      Email.send({
        to: data.email,
        bcc: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: "You're Subscribed!",
        html: SSR.render('htmlEmail', emailData),
      });

      return (Meteor.user());
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async getUserSubscriptionItems(userId) {
    // check(userId, String);
    try {
      const user = Meteor.users.findOne({ _id: userId });
      return user.subscriptions
        .filter(sub => sub.status === 'active')
        .map(sub => Items.findOne({ _id: sub.item_id }));
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async cancelSubscription(userId, subId) {
    // check(userId, String);
    // check(subId, String);

    try {
      const user = Meteor.users.findOne({ _id: userId });
      const { subscriptions } = user;
      let pastSubs = user.past_subscriptions;
      if (!pastSubs) pastSubs = [];
      let sub;

      for (let i = subscriptions.length - 1; i >= 0; i -= 1) {
        if (subscriptions[i]._id === subId) {
          sub = subscriptions[i];
          sub.status = 'canceled';
          sub.canceled_at = moment.utc().toDate();
          subscriptions.splice(i, 1);
          pastSubs.push(sub);
        }
      }

      if (sub) {
        Meteor.users.update({ _id: user._id }, {
          $set: {
            subscriptions,
            past_subscriptions: pastSubs,
          },
        });
      }
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async sendOrderConfirmationEmail(userId, data) {
    // check(data, { email: String, delivery_window_id: Match.Maybe(String) });
    // check(userId, String);
    try {
      const user = Meteor.users.findOne({ _id: userId });
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

      const dw = DeliveryWindows.findOne({ _id: data.delivery_window_id });
      const dateToString = moment(dw.delivery_start_time).format('dddd, MMMM Do,');

      const packItems = data.sub_items ? data.sub_items.items : [];
      const products = (data.items || []).concat(packItems);

      const emailData = {
        ...data,
        email: user.emails[0].address,
        deliveryInfo: dateToString,
        products,
      };

      Email.send({
        to: emailData.email,
        bcc: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: 'Your custom order with Fed',
        html: SSR.render('htmlEmail', emailData),
      });

      return true;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async sendGiftCard(giftCard) {
    const {
      recipient: {
        first_name: recipientFirstName,
        last_name: recipientLastName,
        email: recipientEmail,
      },
      customer: {
        first_name: customerFirstName,
      },
      value,
    } = giftCard;

    try {
      const code = makeGiftCardCode();

      const promo = {
        codes: [code],
        desc: `Fed Gift Card for ${recipientFirstName} ${recipientLastName}`,
        type: 'gift',
        credit: value / 100,
        useLimitPerCustomer: 1,
        useLimitTotal: 1,
        timesUsed: 0,
        active: true,
      };

      insertPromo.call(promo);

      sendGiftToUserViaEmail({
        recipientEmail,
        value: giftCard.value,
        code,
        customerFirstName,
        message: giftCard.message,
        cardType: 'Gift Card',
      });

      return code;
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async referUser(user) {
    // check(user, {
    //   email: String,
    //   password: String,
    //   referrer: String,
    //   zipCode: String,
    // });

    const {
      email,
      password,
      referrer,
      zipCode,
      dl,
    } = user;

    try {
      const customer = {
        email,
        password,
      };

      const _id = Accounts.createUser(customer);

      Accounts.sendVerificationEmail(_id, email, (error) => {
        if (error) { return (error); }
        return undefined;
      });

      Meteor.users.update({ _id }, { $set: { address_zipcode: zipCode, referrer, dl } });

      const emailData = { email };

      switch (referrer) {
        case 'Equinox':
          emailData.subject = 'Your Get Fed Promotion From Equinox!';
          emailData.file = 'equinox.html';
          break;
        case 'WeWork':
          emailData.subject = 'Your Get Fed Promotion From WeWork!';
          emailData.file = 'wework.html';
          break;
        case 'DeanStreet':
          emailData.subject = 'Your Get Fed Promotion From Dean Street Block Party!';
          emailData.file = 'deanstreet.html';
          break;
        case 'Orange Theory':
          emailData.subject = 'Your Get Fed Promotion From Orange Theory Fitness!';
          emailData.file = 'ot.html';
          break;
        case 'Primary':
          emailData.subject = 'Your Get Fed Promotion From Primary!';
          emailData.file = 'primary.html';
          break;
        default:
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
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async createAmbassador(user) {
    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      referrer,
      zipCode,
      ambassador,
      comments,
    } = user;

    try {
      const emailData = { first_name, email };

      if (!Meteor.user()) {
        const customer = {
          email,
          password,
        };

        const _id = Accounts.createUser(customer);

        Accounts.sendVerificationEmail(_id, email, (error) => {
          if (error) { return (error); }
          return undefined;
        });

        Meteor.users.update({ _id }, {
          $set: {
            address_zipcode: zipCode, referrer, ambassador,
          },
        });
      }
      

      // const promo = {
      //   codes: [emailData.code],
      //   desc: `Fed Ambassador Code for ${email}`,
      //   credit: 20,
      //   useLimitPerCustomer: 1,
      //   useLimitTotal: 0,
      //   timesUsed: 0,
      //   active: true,
      //   type: 'ambassador',
      //   ambassador: _id,
      // };

      // insertPromo.call(promo);

      // send ambassador-applied email to user
      emailData.subject = 'Thanks for applying to the Fed Ambassador program!';
      emailData.file = 'ambassador-applied.html';

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

      // send ambassador-request email to Fed

      Email.send({
        to: 'info@getfednyc.com',
        from: 'no-reply@getfednyc.com',
        subject: 'New Ambassador Request',
        text: first_name + ' ' + last_name + ' at ' + email + ' / ' + phone  + ' from ' + referrer + ' would like to join our ambassador program.    ' + comments,
      });

      return Meteor.userId();
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  async checkUserHasPurchased(email) {
    // check(email, String);
    try {
      const exists = Meteor.users.findOne({ 'emails.address': email });
      return (exists && exists.last_purchase);
    } catch (err) {
      throw new Meteor.Error(err.statusCode, err.message);
    }
  },

  // updatePassword (id, key) {
  //   Accounts.setPassword(id, key);
  // },
});

Meteor.publish('limitedUserData', function () {
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

Meteor.publish('someUserData', function () {
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

Meteor.publish('thisUserData', function (id) {
  // check(id, Match.Maybe(String));

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

Meteor.publish('userData', function (limit) {
  // check(limit, Number);
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

Meteor.publish('newestUsers', function (limit) {
  // check(limit, Number);
  new SimpleSchema({ limit: { type: Number } }).validate({ limit });

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

Meteor.publish('subscriberData', function () {
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

Meteor.publish('subscriberFullData', function () {
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

Meteor.publish('unsubscriberData', function () {
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

Meteor.publish('userSearchData', function () {
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
