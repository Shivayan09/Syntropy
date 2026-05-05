# Syntropy Mobile

React Native mobile app scaffold for the existing Syntropy web product.

## What is already wired

- Expo Router app shell
- Mobile-safe bearer auth against the existing Express API
- Email login
- 3-step OTP registration
- Dashboard, analytics, tests, history, and profile screens
- Shared visual language based on the current web tokens

## What still needs parity work

- Google sign-in on native
- Manual test builder
- AI test generation form
- Attempt flow, review flow, result pages
- Syllabus upload
- Subscription and payment flows
- Leaderboard, support, onboarding, and reset-password screens

## Run locally

1. `cd mobile`
2. `npm install`
3. create `.env` from `.env.example`
4. `npm run start`

For Android Play Store release, this Expo app can later be built with EAS once the remaining feature parity work is finished.
