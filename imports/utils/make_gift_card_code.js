export default () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 4; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  text += '-';
  for (let i = 0; i < 6; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  text += '-';
  for (let i = 0; i < 4; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};
