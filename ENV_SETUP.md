# Environment Variables Setup

This file contains the environment variables needed for the Money Tracker Mobile app.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings:
# https://app.supabase.com/project/_/settings/api

# Your Supabase project URL
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase project anon/public key
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## How to Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → Use as `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Important Notes

- In Expo, environment variables that should be accessible in the app **must** be prefixed with `EXPO_PUBLIC_`
- Never commit your `.env` file to version control
- Make sure `.env` is listed in your `.gitignore` file
- After creating/updating `.env`, restart your Expo development server

## Verification

After setting up your `.env` file, you can verify it's working by:

1. Importing the Supabase client in any file:
   ```typescript
   import { supabase } from '@/lib/supabase';
   ```

2. Checking the console for any warnings about missing environment variables

3. Testing a simple query:
   ```typescript
   const { data, error } = await supabase.from('budgets').select('count');
   console.log('Supabase connection:', error ? 'Failed' : 'Success');
   ```

