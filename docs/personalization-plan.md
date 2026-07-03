# Personalization Plan

Version: v2.1.3

## Goal

Add personal progress tracking for each Discord user.

The Warframe item data remains read-only from Google Sheets.
User-specific data should be stored separately in a database.

## User-specific features

- Owned / missing status
- Category completion rate
- Total platinum estimate
- Wishlist
- Last updated time
- Personal filters
- Guild-specific permissions

## Data separation

Shared data:

- Warframe items
- Market price
- Source / acquisition method
- Notes
- Category sections

Personal data:

- Discord user ID
- Owned item IDs
- User preferences
- Completion statistics

Guild data:

- Discord guild ID
- Allowed role IDs
- Subscription status
- Guild branding
- Enabled features

## Recommended next step

Use Supabase or Neon Postgres as the first database layer.
