/* eslint-disable */
(() => {
  const env = process.env.ROOT_URL;
  const devUrl = "http://localhost";
  if (env && env.indexOf(devUrl) !== -1) { return; }
  Kadira.connect('xc5myAnQ8HNhtqGxu', 'ad8012d1-e6b8-45e0-83e3-a83200fd2b9d');
})();
/* eslint-enable */
