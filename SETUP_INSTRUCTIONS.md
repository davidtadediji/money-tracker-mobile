# 🚀 Setup Instructions

## Quick Fix for Supabase Error

You're seeing this error because the `.env` file needs your actual Supabase credentials.

## Step-by-Step Setup

### Option 1: Use Mock/Development Mode (Quick Start)

If you just want to test the UI without connecting to Supabase yet:

1. Update `lib/supabase.ts` to use mock values temporarily
2. This allows you to see the UI and test functionality without a database

### Option 2: Connect to Supabase (Recommended)

#### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: money-tracker-mobile
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait 1-2 minutes for the project to be created

#### 2. Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string of characters)

#### 3. Update Your .env File

Open the `.env` file in your project root and replace the placeholder values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Important:** Replace both values with your actual credentials!

#### 4. Run the Database Migration

You need to create the `budgets` table in your Supabase database:

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the entire contents of `supabase/migrations/20250126_create_budgets_table.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

#### 5. Restart Your Expo Server

**This is critical!** Environment variables are only loaded when the server starts.

1. Stop your current Expo server (press `Ctrl + C` in the terminal)
2. Restart it:
   ```bash
   npm start
   ```
3. Press `i` for iOS or `a` for Android

## Verification

After setup, you should:
1. ✅ No more "supabaseUrl is required" error
2. ✅ Be able to create budgets
3. ✅ See budgets in the list
4. ✅ Be able to delete budgets

## Troubleshooting

### Still seeing the error?

1. **Check .env file location**: Must be in project root (same folder as package.json)
2. **Check variable names**: Must start with `EXPO_PUBLIC_` exactly
3. **Restart Expo**: Environment changes require server restart
4. **Check for typos**: Copy-paste credentials to avoid mistakes

### Budgets not saving?

1. **Check database migration**: Verify the `budgets` table exists in Supabase Dashboard → Database → Tables
2. **Check RLS policies**: Go to Authentication → Policies in Supabase Dashboard
3. **Check browser console**: Look for error messages
4. **Verify user is authenticated**: Make sure you're logged in

### Can't connect to Supabase?

1. **Check internet connection**
2. **Verify project URL**: Should end with `.supabase.co`
3. **Check Supabase project status**: Make sure it's running (green status in dashboard)

## Quick Test

To test if Supabase is connected, add this to any component:

```typescript
import { supabase } from '@/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('budgets').select('count');
  console.log('Connection test:', error ? 'Failed' : 'Success');
};
```

## Security Notes

⚠️ **Never commit your .env file to git!**
- The `.env` file is already in `.gitignore`
- Keep your credentials secure
- Don't share them publicly
- Use different credentials for development and production

## Alternative: Use Dummy Data (No Supabase)

If you want to test without setting up Supabase:

1. Comment out the Supabase client error in `lib/supabase.ts`
2. Modify `BudgetContext.tsx` to use local state instead of fetching from Supabase
3. This is temporary and won't persist data

## Need Help?

Check these resources:
- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete setup guide
- [Context Integration Guide](./CONTEXT_INTEGRATION_GUIDE.md) - How to use BudgetContext
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

---

**Quick Summary:**
1. Create Supabase project at supabase.com
2. Get credentials from Settings → API
3. Update .env file with real credentials
4. Run database migration in SQL Editor
5. Restart Expo server
6. Done! 🎉

