import { Meteor } from 'meteor/meteor';
import { AccountsTemplates } from 'meteor/useraccounts:core';

// Zip Codes
import { yesZips } from '/imports/api/delivery/zipcodes.js';

AccountsTemplates.configure({
  // Behavior
  sendVerificationEmail: true,

  // Appearance
  showForgotPasswordLink: true,
  confirmPassword: false,
  defaultTemplate: 'Auth_page',
  defaultLayout: 'App_body',
  defaultContentRegion: 'main',
  defaultLayoutRegions: {},

  // Texts
  texts: {
    button: {
      signUp: 'Get fed!',
    },
    errors: {
      loginForbidden: 'Incorrect username or password',
      pwdMismatch: 'Passwords don\'t match',
    },
    title: {
      signIn: 'Sign In',
      signUp: 'Get Started',
    },
  },

  // PP + T&C
  // privacyUrl: 'privacy',
  // termsUrl: 'terms-of-use',

  // Redirects
  homeRoutePath: '/',

  // Hooks
  postSignUpHook(userId) {
    const user = Meteor.users.findOne(userId);
    const addressZipcode = user.profile.zipCode;
    const amountSpent = 0;
    const data = {
      address_zipcode: addressZipcode,
      amount_spent: amountSpent,
    };

    Meteor.call('updateUser', user._id, data, () => { });

    // createCustomer.call(customer, (error, response) => {
    //   if (error) {
    //     console.log('Whoops! ' + error.reason);
    //   } else {
    //     console.log(response);
    //   }
    // });
  },
});

// AccountsTemplates.removeField('email');
// AccountsTemplates.addField({
//   _id: 'email',
//   type: 'email',
//   required: true,
//   displayName: "Email",
//   re: /.+@(.+){2,}\.(.+){2,}/,
//   errStr: 'Invalid email',
// });
// AccountsTemplates.removeField('password');
// AccountsTemplates.addField({
//   _id: 'password',
//   type: 'password',
//   required: true,
//   minLength: 6,
//   errStr: 'Your password must be at least 6 characters long.',
// });

AccountsTemplates.addFields([
  {
    _id: 'zipCode',
    type: 'text',
    displayName: 'Where do you live?',
    placeholder: {
      signUp: 'Enter your zip code',
    },
    required: true,
    func (value) {
      if (yesZips.indexOf(value) >= 0) {
        return false; // meaning no error!
      }
      return true; // Validation error!
    },
    errStr: "Sorry. It looks like we don't deliver to your area yet.",
  },
  // {
  //   _id: 'diet',
  //   type: 'radio',
  //   displayName: 'What do you eat?',
  //   select: [
  //     {
  //       text:'Vegan',
  //       value: 'vegan',
  //     },
  //     {
  //       text: 'Vegetarian',
  //       value: 'veggie',
  //     },
  //     {
  //       text: 'Omnivore',
  //       value: 'omnivore',
  //     },
  //   ],
  //   required: true,
  // }
]);
