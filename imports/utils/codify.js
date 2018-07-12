// import { ValidatedMethod } from 'meteor/mdg:validated-method';

export const makeGiftCardCode = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (var i = 0; i < 4; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  text += '-';
  for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  text += '-';
  for (var i = 0; i < 4; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

export const useCredit = (user_id, credit) => {

};

export const addCredit = (user_id, credit) => {

};
