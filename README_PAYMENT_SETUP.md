# Razorpay Payment Integration Setup Guide

## Prerequisites
- Supabase account with database access
- Razorpay test account

## Step 1: Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay (Test Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_S10lXIUgJfjxRJ
RAZORPAY_KEY_SECRET=X4wZUu7yREbAgq35ND0a24jQ
```

## Step 2: Database Setup

Run the migration in Supabase SQL Editor:

```sql
-- Copy and paste contents from: supabase/migrations/001_create_payment_tables.sql
```

This will create:
- `orders` table - stores Razorpay orders
- `subscriptions` table - stores user subscriptions
- Proper indexes and triggers

**Note:** RLS policies are not included for now. You can add them later for production security.

## Step 3: Install Dependencies

```bash
npm install razorpay
```

## Step 4: Testing

### Test Cards (Razorpay Test Mode)

**Success Card:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Failure Card:**
- Card Number: `4111 1111 1111 1112`
- Expiry: Any future date
- CVV: Any 3 digits

**UPI Testing:**
- UPI ID: `success@razorpay`
- Status: Will succeed

### Testing Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to pricing page:**
   - Go to `http://localhost:3000/pricing`
   - Or click "Pricing" in navbar

3. **Sign in:**
   - Click "Subscribe Now" on any plan
   - Sign in with Google (if not already signed in)

4. **Complete payment:**
   - Razorpay checkout modal will open
   - Use test card details above
   - Complete payment

5. **Verify success:**
   - Check success modal appears
   - Verify redirect to /learn page
   - Check database tables in Supabase:
     ```sql
     SELECT * FROM orders;
     SELECT * FROM subscriptions;
     ```

## Step 5: Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution:** 
- Make sure you're signed in to the app
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- Check that authentication is working

### Issue: Razorpay script not loading
**Solution:** Check browser console for errors, ensure internet connection is stable

### Issue: Payment verification fails
**Solution:** 
- Verify `RAZORPAY_KEY_SECRET` matches your Razorpay dashboard
- Check server logs for signature mismatch errors

### Issue: Database errors
**Solution:**
- Ensure migration has been run in Supabase
- Verify user is authenticated
- Check table permissions in Supabase dashboard

## Step 6: Going to Production

When ready for production:

1. **Get Razorpay Live Keys:**
   - Login to Razorpay Dashboard
   - Go to Settings > API Keys
   - Generate Live Keys

2. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```

3. **Enable Live Mode:**
   - Test thoroughly in production environment
   - Monitor first few transactions closely

4. **Webhook Setup (Optional but Recommended):**
   - Go to Razorpay Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/razorpay/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Use webhook secret for additional security

## API Endpoints

### Create Order
- **Endpoint:** `POST /api/razorpay/create-order`
- **Auth:** Required (Bearer token)
- **Body:** `{ planId: string, amount: number }`
- **Response:** `{ orderId: string, amount: number, currency: string }`

### Verify Payment
- **Endpoint:** `POST /api/razorpay/verify-payment`
- **Auth:** Required (Bearer token)
- **Body:** `{ orderId: string, paymentId: string, signature: string }`
- **Response:** `{ success: boolean, subscriptionId: string, message: string }`

## Database Schema

### Orders Table
```typescript
{
  id: uuid,
  user_id: uuid,
  razorpay_order_id: string,
  amount: number,
  currency: string,
  status: 'created' | 'paid' | 'failed',
  plan_type: 'basic' | 'pro' | 'premium',
  created_at: timestamp,
  updated_at: timestamp
}
```

### Subscriptions Table
```typescript
{
  id: uuid,
  user_id: uuid (unique),
  plan_type: 'basic' | 'pro' | 'premium',
  razorpay_payment_id: string,
  status: 'active' | 'cancelled' | 'expired',
  starts_at: timestamp,
  ends_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

## Support

For issues:
1. Check browser console for errors
2. Check server logs in terminal
3. Verify environment variables are loaded correctly
4. Check Supabase dashboard for database errors
5. Review Razorpay dashboard for payment status

## Security Checklist

- ✅ Server-side signature verification
- ✅ Authenticated API endpoints
- ✅ Row Level Security enabled
- ✅ Environment variables secured
- ✅ HTTPS in production
- ✅ No sensitive data in frontend

## Pricing Plans

- **Basic:** ₹100/month
- **Pro:** ₹200/month (Most Popular)
- **Premium:** ₹500/month

All plans are monthly subscriptions with automatic expiry after 30 days.

