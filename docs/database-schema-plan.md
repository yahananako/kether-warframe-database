# Database Schema Plan

Version: v2.1.3

## users

- id
- discord_user_id
- discord_username
- avatar_url
- created_at
- updated_at

## guilds

- id
- discord_guild_id
- guild_name
- owner_discord_user_id
- subscription_status
- subscription_expires_at
- created_at
- updated_at

## guild_allowed_roles

- id
- guild_id
- discord_role_id
- role_name
- created_at

## user_owned_items

- id
- user_id
- guild_id
- item_key
- category
- section
- owned
- updated_at

## user_preferences

- id
- user_id
- preferred_language
- default_filter
- compact_mode
- created_at
- updated_at

## subscription_plans

- id
- guild_id
- plan_name
- status
- max_members
- enabled_features
- started_at
- expires_at

## Notes

Do not store Google Sheets raw secrets in the repository.
Use Vercel Environment Variables for all secrets.
