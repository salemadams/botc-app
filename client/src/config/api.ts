import Constants from 'expo-constants';

const getDevApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:4000`;
  }
  return 'http://localhost:4000';
};

const ENV = {
  dev: {
    apiUrl: getDevApiUrl(),
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
