/* eslint-disable */
import { isDevMode } from './helpers';

(() => {
  if (isDevMode()) { return; }
  Kadira.connect('qMrXQEqLCBtEKiBcN', 'szksHEs3mzdButGn8', { endpoint: 'https://apm-engine.fed.dubcell.com' });
})();
/* eslint-enable */
