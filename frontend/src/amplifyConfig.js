import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
    loginWith: {
      email: true,
      username: true,
    },
  },
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
