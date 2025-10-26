# Authentication Setup Guide

This project uses Supabase for authentication. Follow these steps to set up authentication properly.

## Prerequisites

1. A Supabase account and project
2. Node.js installed
3. Environment variables configured

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to get these values:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the **anon/public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Authentication Flow

### 1. **Middleware Protection**
The `middleware.ts` file automatically:
- Checks if a user is authenticated on every request
- Redirects unauthenticated users to `/auth/login` when accessing protected routes
- Redirects authenticated users away from auth pages to their dashboard
- Refreshes the session automatically

### 2. **Protected Routes**
The following routes are protected and require authentication:
- `/student/*` - Student dashboards and pages
- `/company/*` - Company dashboards and pages
- `/supervisor/*` - Supervisor dashboards and pages

### 3. **Public Routes**
These routes are accessible without authentication:
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page

### 4. **Role-Based Redirects**
When a user logs in, they are redirected based on their role:
- **Student** → `/student/{user_id}/dashboard`
- **Company** → `/company/{user_id}/dashboard`
- **Supervisor** → `/supervisor/dashboard`

The role is stored in the user's metadata (`user.user_metadata.role`).

## Files Overview

### Core Authentication Files

1. **`middleware.ts`**
   - Handles route protection
   - Refreshes sessions automatically
   - Manages redirects based on auth state

2. **`lib/supabase.ts`**
   - Client-side Supabase client
   - Used in React components

3. **`lib/server-supabase.ts`**
   - Server-side Supabase client
   - Used in Server Components and API routes

4. **`lib/auth-helpers.ts`**
   - Helper functions for authentication
   - `signOut()`, `getCurrentUser()`, `getDashboardUrl()`, etc.

5. **`app/auth/login/page.tsx`**
   - Login page with Supabase authentication

6. **`app/auth/register/page.tsx`**
   - Registration page with Supabase authentication

## User Registration

When registering a new user, you can set their role in the metadata:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe',
      role: 'student', // or 'company', 'supervisor'
    },
  },
})
```

## Using Authentication in Components

### Client Components

```typescript
import { supabase } from '@/lib/supabase'
import { signOut, getCurrentUser } from '@/lib/auth-helpers'

// Get current user
const { user, error } = await getCurrentUser()

// Sign out
await signOut()
```

### Server Components

```typescript
import { createClient } from '@/lib/server-supabase'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

## Debugging

The middleware includes console logs for debugging:
- `Middleware:` - Shows auth state for each request
- `User in middleware:` - Shows if a user is detected
- `Session in middleware:` - Shows if a session exists

Check your terminal/console for these logs.

## Common Issues

### Issue: User is null in middleware

**Solutions:**
1. Verify environment variables are set correctly
2. Check that cookies are being sent (check browser DevTools → Application → Cookies)
3. Ensure Supabase project URL and key are correct
4. Clear browser cookies and try logging in again

### Issue: Infinite redirect loop

**Solutions:**
1. Check that protected route patterns don't overlap with auth routes
2. Verify the user's role is set correctly in their metadata
3. Check middleware logs for the redirect behavior

### Issue: "Invalid API key" error

**Solutions:**
1. Double-check the `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
2. Make sure you're using the **anon/public** key, not the **service_role** key
3. Restart your Next.js development server after changing environment variables

## Testing Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth/register` and create a test account

3. Check the console logs to see if authentication is working

4. Try accessing a protected route like `/student/{your-user-id}/dashboard`

5. Sign out and verify you're redirected to the login page when accessing protected routes

## Next Steps

- Set up email confirmation (optional)
- Configure OAuth providers (Google, GitHub, etc.)
- Set up Row Level Security (RLS) in Supabase
- Create database tables for your application data

