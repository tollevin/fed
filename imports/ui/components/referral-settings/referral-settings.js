import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { SETTING_SESSION, MAIN } from '/imports/ui/lib/constants/settings';

import './referral-settings.less';
import './referral-settings.html';

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
  'click #add-another-friend'(event) {
    event.preventDefault();

    const referrals = Template.instance().referrals.get();
    Template.instance().referrals.set([...referrals, BLANK_REFERRAL]);
  },
});
