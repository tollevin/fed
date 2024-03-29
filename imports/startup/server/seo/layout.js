import { Template } from 'meteor/templating';
import { SSR } from 'meteor/meteorhacks:ssr';

SSR.compileTemplate('seoLayout', Assets.getText('layout.html'));
// Blaze does not allow to render templates with DOCTYPE in it.
// This is a trick to made it possible
Template.seoLayout.helpers({
  getDocType() {
    return '<!DOCTYPE html>';
  },
});
