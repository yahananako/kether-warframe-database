# KETHER Warframe Database Discord Auth Plan

## Current version

v2.1.2 is a front-end preparation step.

It adds:

- /login
- /unauthorized
- Homepage login entry
- Permission architecture notes

No real Discord OAuth secret is stored yet.

## Future auth flow

1. User clicks Discord login.
2. Discord OAuth returns user profile.
3. Website checks Discord Guild membership.
4. Website checks allowed roles.
5. If allowed, user can access personalized features.
6. If not allowed, user is sent to /unauthorized.

## Personalization database

Future tables:

- users
- guilds
- guild_subscriptions
- guild_roles
- user_owned_items
- user_preferences

## Multi guild paid platform

Each Discord guild will have:

- guildId
- guildName
- ownerDiscordId
- subscriptionStatus
- subscriptionExpiresAt
- allowedRoleIds
- customBranding
- enabledFeatures

## Security note

Do not put real Discord client secret, database URL, or Google service account key in GitHub.

Use Vercel Environment Variables.
