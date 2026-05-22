# Cognito Authentication Frontend Demo

Static HTML/CSS/JS prototype with AWS Cognito authentication integration.

## Files
- `index.html` - Login/signup UI with Cognito SDK
- `script.js` - Authentication logic and API calls  
- `style.css` - Mobile-first styling

## AWS Configuration
- **User Pool:** sovereign-sentinel-users (us-east-1_eC3nvhZd8)
- **App Client ID:** 6e9aoacduauq99vgd1l0f9nvok
- **API Gateway:** https://1aap5l8ly2.execute-api.us-east-1.amazonaws.com/prod

## Features
- ✅ Signup with email verification
- ✅ Login with JWT token
- ✅ Authenticated API calls
- ✅ Add, view, delete emergency supplies
- ✅ Auto-logout on session expiration

## Status
**Working** - Users can sign up, log in, and manage their emergency supply inventory.

## Known Issues
- Email verification codes not sending automatically (manual workaround: confirm users in AWS Console)

## Security
- All API routes protected with Cognito authorizer
- JWT tokens required for all requests
- User data isolated by Cognito sub (UUID)
