/* eslint-disable */
(() => {
  const env = process.env.ROOT_URL;
  const devUrl = "http://localhost";
  if (env && env.indexOf(devUrl) !== -1) { return; }
  Kadira.connect('qMrXQEqLCBtEKiBcN', 'szksHEs3mzdButGn8', { endpoint: 'https://apm-engine.fed.dubcell.com' });
})();
/* eslint-enable */
