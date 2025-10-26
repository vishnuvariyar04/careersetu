# Fix Email Confirmation Issue - Quick Guide

## The Problem
- Users register but middleware shows `user: null`
- Session is not being persisted after registration
- This is because Supabase has **email confirmation enabled** by default

## The Solution

### Step 1: Disable Email Confirmation in Supabase (REQUIRED)

You MUST do this in your Supabase dashboard:

1. **Go to:** https://app.supabase.com
2. **Select** your project
3. **Navigate to:** Authentication → Providers → Email
4. **Find:** "Confirm email" toggle
5. **Turn it OFF** (disable it)
6. **Click:** Save

### Alternative Location:
If you can't find it there, try:
- Authentication → Settings → Email Auth Provider
- Disable "Confirm email"
- Save

## Step 2: Test After Disabling

Once you've disabled email confirmation:

1. **Clear your browser cookies** (important!)
2. Go to `http://localhost:3000/auth`
3. Register with a new email
4. You should be:
   - ✅ Immediately logged in
   - ✅ Redirected to dashboard
   - ✅ Session persists

## Debug Your Session

Visit `http://localhost:3000/debug-session` to see:
- Current session state
- User information
- Cookies present
- Any errors

## What to Check in Console Logs

After registration, you should see:
```
Registration result: {
  hasUser: true,
  hasSession: true,  ← THIS SHOULD BE TRUE
  userId: "xxx-xxx-xxx"
}
User has session, redirecting to dashboard
```

In middleware:
```
All cookies in middleware: ['sb-xxx-auth-token', ...]
User in middleware: {
  hasUser: true,
  email: "your@email.com"
}
```

## If It Still Doesn't Work

1. **Check Supabase URL & Key:**
   - Make sure `.env.local` has correct values
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Clear ALL browser data:**
   - In Chrome: F12 → Application → Clear site data
   - Or use Incognito/Private mode

4. **Check Supabase Auth Settings:**
   - Go to Authentication → URL Configuration
   - Make sure Site URL is set to `http://localhost:3000`
   - Redirect URLs should include `http://localhost:3000/**`

## Common Issues

### Issue: "Email not confirmed" error
**Solution:** Email confirmation is still enabled. Go back to Step 1.

### Issue: Session is null after registration
**Solution:** 
1. Email confirmation is enabled (disable it)
2. Browser cookies are blocked (check browser settings)
3. Wrong Supabase credentials (check .env.local)

### Issue: Redirect loop
**Solution:** 
1. Clear cookies
2. Check middleware logs to see what's happening
3. Make sure user has a role set in metadata

## Verify It's Working

You'll know it's working when:
1. ✅ Register a new user
2. ✅ Console shows "Registration successful" with `hasSession: true`
3. ✅ Automatically redirected to dashboard
4. ✅ Middleware logs show `hasUser: true`
5. ✅ Can navigate without being logged out
6. ✅ Visiting `/` or `/auth` redirects to dashboard

## Files Updated

All code is ready to work with or without email confirmation:
- ✅ `app/auth/page.tsx` - Handles both scenarios
- ✅ `middleware.ts` - Better cookie debugging
- ✅ `app/debug-session/page.tsx` - NEW debug tool

---

**Most Important:** Disable email confirmation in Supabase dashboard! This is the #1 issue.

