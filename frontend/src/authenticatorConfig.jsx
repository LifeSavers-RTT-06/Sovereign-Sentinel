import { useAuthenticator } from '@aws-amplify/ui-react';
import { I18n } from 'aws-amplify/utils';

I18n.putVocabulariesForLanguage('en', {
  'Forgot your password?': 'Forgot password?',
  'Reset Password': 'Reset password',
  'Send Code': 'Send reset code',
  'Submit': 'Update password',
  'Back to Sign In': 'Back to sign in',
  'Enter your Username': 'Enter your email or username',
  Username: 'Email or username',
  'Confirmation Code': 'Reset code',
  'New Password': 'New password',
  'Confirm Password': 'Confirm new password',
  'User does not exist.': 'We could not find an account for that email or username.',
  'Username cannot be empty': 'Enter your email or username to reset your password.',
  'Invalid verification code provided, please try again.':
    'The reset code is invalid. Check the code and try again.',
  'Invalid code provided, please request a code again.':
    'The reset code is invalid or expired. Request a new code and try again.',
  'Invalid verification code provided.': 'The reset code is invalid. Check the code and try again.',
  'Code mismatch': 'The reset code is invalid. Check the code and try again.',
  'Code expired': 'The reset code has expired. Request a new code and try again.',
  'Invalid password': 'Choose a stronger password that meets the password requirements.',
  'Password does not conform to policy: Password not long enough':
    'Choose a longer password that meets the password requirements.',
  'Password does not conform to policy: Password must have uppercase characters':
    'Use at least one uppercase letter in your new password.',
  'Password does not conform to policy: Password must have lowercase characters':
    'Use at least one lowercase letter in your new password.',
  'Password does not conform to policy: Password must have numeric characters':
    'Use at least one number in your new password.',
  'Password does not conform to policy: Password must have symbol characters':
    'Use at least one symbol in your new password.',
  'Attempt limit exceeded, please try after some time.':
    'Too many reset attempts. Wait a few minutes, then try again.',
});

function SignInFooter() {
  const { toForgotPassword } = useAuthenticator();

  return (
    <div className="auth-reset-footer">
      <button type="button" className="auth-reset-link" onClick={toForgotPassword}>
        Forgot password?
      </button>
      <p>Use Cognito password recovery to receive a reset code by email.</p>
    </div>
  );
}

export const authenticatorComponents = {
  SignIn: {
    Footer: SignInFooter,
  },
};

export const authenticatorFormFields = {
  signIn: {
    username: {
      label: 'Email or username',
      placeholder: 'Enter your email or username',
      isRequired: true,
    },
    password: {
      label: 'Password',
      placeholder: 'Enter your password',
      isRequired: true,
    },
  },
  forgotPassword: {
    username: {
      label: 'Email or username',
      placeholder: 'Enter the email or username on your account',
      isRequired: true,
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      label: 'Reset code',
      placeholder: 'Enter the reset code from your email',
      isRequired: true,
    },
    password: {
      label: 'New password',
      placeholder: 'Enter a new password',
      isRequired: true,
    },
    confirm_password: {
      label: 'Confirm new password',
      placeholder: 'Re-enter your new password',
      isRequired: true,
    },
  },
};
