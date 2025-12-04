const ENV = {
  dev: {
    apiUrl: 'http://localhost:4000',
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
