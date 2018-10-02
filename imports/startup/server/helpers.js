
export const isDevMode = () => {
  const env = process.env.ROOT_URL;
  const devUrl = 'http://localhost';
  return (env && env.indexOf(devUrl) !== -1);
};
