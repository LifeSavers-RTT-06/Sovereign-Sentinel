# PrepTrack Mobile-First Static Frontend Prototype

This folder contains static files that can be uploaded to an Amazon S3 bucket for the Week 1 placeholder frontend.

## Files

- `index.html` — mobile-first dashboard using Tailwind and Flowbite CDN
- `style.css` — custom reusable styles
- `script.js` — demo inventory cards, category filter, and demo add-item behavior

## Upload to S3

Upload these files to the root of the configured S3 bucket:

- index.html
- style.css
- script.js

Then test through the CloudFront URL after the distribution is ready.

## Design Notes

This version is mobile-first:
- Card-based inventory instead of a wide table
- Sticky header
- Bottom navigation for phone screens
- Larger touch targets
- Responsive layout that expands on desktop

This is a static prototype. It does not connect to Cognito, API Gateway, Lambda, or DynamoDB yet.
