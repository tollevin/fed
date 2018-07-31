import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import { SETTING_SESSION, MAIN } from '/imports/ui/lib/constants/settings';

import { createEmailPromos } from '/imports/api/promos/methods.js';

import './referral-settings.less';
import './referral-settings.html';

const REFERRAL_SELECTOR = 'input.referral';
const BLANK_REFERRAL = { email: '' };

Template.Referral_settings.onCreated(function dietSettingsOnCreated() {
  const initialNumberOfReferrals = 3;
  const referrals = Array(initialNumberOfReferrals)
    .fill()
    .map(() => BLANK_REFERRAL);
  this.referrals = new ReactiveVar(referrals);
});

Template.Referral_settings.helpers({
  referrals: () => Template.instance().referrals.get(),
});

Template.Referral_settings.events({
  'click #add-another-friend'(event, templateInstance) {
    event.preventDefault();
    const referrals = templateInstance
      .findAll(REFERRAL_SELECTOR)
      .map(({ value }) => ({ email: value }));

    Template.instance().referrals.set([...referrals, BLANK_REFERRAL]);
  },

  'click #submit-referrals'(event, templateInstance) {
    event.preventDefault();

    const referralEmails = templateInstance
      .findAll(REFERRAL_SELECTOR)
      .map(({ value }) => value)
      .filter(e => e);

    createEmailPromos.call({ emails: referralEmails, userId: Meteor.userId() }, (err) => {
      if (err) {
        sAlert.error('Email failure');
        return;
      }
      sAlert.success('Emails Successfully Sent!');
      Session.set(SETTING_SESSION, MAIN);
    });
  },
});
