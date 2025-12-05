const ENV = {
  dev: {
    apiUrl: 'http://10.20.56.38:4000',
  },
  prod: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://your-production-url.com',
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars();
