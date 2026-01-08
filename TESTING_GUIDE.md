# Payment Integration Testing Guide

## Pre-Testing Checklist

### 1. Environment Setup
Ensure `.env.local` contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_S10lXIUgJfjxRJ
RAZORPAY_KEY_SECRET=X4wZUu7yREbAgq35ND0a24jQ
```

### 2. Database Setup
Run the SQL migration in Supabase:
```sql
-- Execute: supabase/migrations/001_create_payment_tables.sql
```

Verify tables exist:
```sql
SELECT * FROM orders LIMIT 1;
SELECT * FROM subscriptions LIMIT 1;
```

### 3. Dependencies
```bash
npm install razorpay
```

## Test Cases

### Test Case 1: Successful Payment Flow (Basic Plan)

**Steps:**
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/pricing`
3. Click "Subscribe Now" on Basic Plan (₹100)
4. Sign in with Google if not authenticated
5. Razorpay modal should open
6. Enter test card details:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`
7. Click Pay

**Expected Results:**
- ✅ Success modal appears
- ✅ Redirects to `/learn` page
- ✅ Database `orders` table has new record with status='paid'
- ✅ Database `subscriptions` table has/updated record with plan_type='basic', status='active'

**SQL Verification:**
```sql
SELECT * FROM orders WHERE user_id = 'your_user_id' ORDER BY created_at DESC LIMIT 1;
SELECT * FROM subscriptions WHERE user_id = 'your_user_id';
```

### Test Case 2: Failed Payment

**Steps:**
1. Navigate to `/pricing`
2. Click "Subscribe Now" on Pro Plan (₹200)
3. Use failure test card: `4111 1111 1111 1112`
4. Complete payment

**Expected Results:**
- ✅ Error modal appears
- ✅ User stays on pricing page
- ✅ Can retry payment
- ✅ Order in database has status='created' (not paid)

### Test Case 3: User Closes Payment Modal

**Steps:**
1. Navigate to `/pricing`
2. Click "Subscribe Now" on Premium Plan (₹500)
3. Close Razorpay modal using X button

**Expected Results:**
- ✅ Modal closes gracefully
- ✅ No error message shown
- ✅ User can retry
- ✅ Loading state cleared

### Test Case 4: Unauthenticated User

**Steps:**
1. Sign out if signed in
2. Navigate to `/pricing`
3. Click "Subscribe Now" on any plan

**Expected Results:**
- ✅ Redirects to `/learn` page
- ✅ Auth modal appears
- ✅ After sign in, user can retry payment

### Test Case 5: Navigation Links

**From Landing Page:**
1. Go to `http://localhost:3000`
2. Click "Pricing" in navbar
3. **Expected:** Navigates to `/pricing`

**From Footer:**
1. Scroll to footer on landing page
2. Click "Pricing" in Product section
3. **Expected:** Navigates to `/pricing`

**From Learn Page:**
1. Go to `/learn`
2. Open sidebar (menu icon)
3. Look for "Upgrade Plan" button
4. Click it
5. **Expected:** Navigates to `/pricing`

### Test Case 6: Plan Upgrade (Existing Subscription)

**Steps:**
1. Complete payment for Basic plan
2. Return to `/pricing`
3. Subscribe to Pro plan

**Expected Results:**
- ✅ Payment succeeds
- ✅ Subscription updated (not duplicated)
- ✅ `subscriptions` table shows only 1 record per user
- ✅ Plan type updated to 'pro'

**SQL Verification:**
```sql
SELECT COUNT(*) FROM subscriptions WHERE user_id = 'your_user_id';
-- Should return 1
```

### Test Case 7: Network Failure Simulation

**Steps:**
1. Open DevTools > Network tab
2. Set throttling to "Offline"
3. Try to subscribe to any plan
4. Re-enable network after error

**Expected Results:**
- ✅ Graceful error handling
- ✅ User-friendly error message
- ✅ Can retry after network restored

### Test Case 8: API Endpoint Security

**Test Unauthorized Access:**
```bash
# Without auth token
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic","amount":100}'
```

**Expected:** 401 Unauthorized

**Test Invalid Signature:**
```bash
curl -X POST http://localhost:3000/api/razorpay/verify-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"orderId":"order_123","paymentId":"pay_123","signature":"invalid"}'
```

**Expected:** 400 Invalid signature

### Test Case 9: Mobile Responsive Testing

**Devices to Test:**
- iPhone 12 Pro (390x844)
- Samsung Galaxy S21 (360x800)
- iPad (768x1024)

**Check:**
- ✅ Pricing cards stack properly
- ✅ Payment modal is accessible
- ✅ All buttons are tappable
- ✅ Text is readable

### Test Case 10: UPI Payment (India-specific)

**Steps:**
1. Subscribe to any plan
2. In Razorpay modal, select "UPI"
3. Enter: `success@razorpay`

**Expected Results:**
- ✅ Payment succeeds
- ✅ Same flow as card payment

## Edge Cases

### Edge Case 1: Duplicate Payment Prevention
**Test:** Click "Subscribe Now" multiple times rapidly

**Expected:** 
- Only one order created
- Loading state prevents multiple clicks

### Edge Case 2: Expired Session
**Test:** 
1. Sign in
2. Wait 1 hour (or manually expire token)
3. Try to subscribe

**Expected:**
- Redirects to auth
- After re-auth, can continue

### Edge Case 3: Browser Refresh During Payment
**Test:**
1. Open payment modal
2. Refresh browser
3. Check database

**Expected:**
- Order status remains 'created'
- No orphaned records
- User can retry

## Performance Testing

### Load Time
- **Pricing page load:** < 2 seconds
- **Payment modal open:** < 1 second
- **Order creation API:** < 500ms
- **Payment verification:** < 1 second

### Concurrent Users
Test with 5+ users making payments simultaneously:
```bash
# Use tool like Apache Bench or k6
```

## Security Testing

### Checklist
- ✅ All API routes require authentication
- ✅ Signature verification on backend
- ✅ No secrets exposed in frontend
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS properly configured
- ✅ HTTPS in production
- ⏳ RLS policies (to be added for production)

### Penetration Testing
- SQL injection attempts
- XSS attempts in payment notes
- CSRF token validation
- Rate limiting on API endpoints

## Accessibility Testing

### WCAG Compliance
- ✅ Keyboard navigation works
- ✅ Screen reader announces modals
- ✅ Color contrast meets AA standards
- ✅ Focus indicators visible
- ✅ Error messages are descriptive

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Post-Payment Verification

After each successful payment, verify:

1. **Database:**
```sql
-- Check order
SELECT * FROM orders 
WHERE razorpay_order_id = 'order_xyz';

-- Check subscription
SELECT * FROM subscriptions 
WHERE user_id = 'user_id';
```

2. **Razorpay Dashboard:**
- Login to Razorpay Test Dashboard
- Verify payment appears
- Check payment status
- Verify amount matches

3. **User Experience:**
- Check `/learn` page shows upgraded access
- Verify session limits if applicable
- Test any premium features

## Troubleshooting Common Issues

### Issue: "Failed to create order"
**Debug:**
```javascript
// Check server logs
console.log('Order creation error:', error);
```
**Solutions:**
- Verify Razorpay keys in env
- Check database connection
- Verify user authentication

### Issue: "Invalid signature"
**Debug:**
```javascript
// Log signature components
console.log('Order ID:', orderId);
console.log('Payment ID:', paymentId);
console.log('Generated:', generatedSignature);
console.log('Received:', signature);
```
**Solutions:**
- Verify RAZORPAY_KEY_SECRET matches
- Check order_id format

### Issue: Razorpay script not loading
**Debug:** Check browser console for CSP errors
**Solution:** Verify script src is allowed

## Automated Testing (Optional)

Create E2E tests with Playwright:

```typescript
// tests/payment.spec.ts
test('successful payment flow', async ({ page }) => {
  await page.goto('/pricing');
  await page.click('text=Subscribe Now');
  // ... test flow
});
```

## Production Checklist

Before going live:
- [ ] Replace test keys with live keys
- [ ] Test with real card (small amount)
- [ ] Set up Razorpay webhooks
- [ ] Enable production logging
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup database
- [ ] Test failover scenarios
- [ ] Document rollback procedure

## Success Criteria

All tests pass when:
- ✅ Payment success rate > 99%
- ✅ No security vulnerabilities
- ✅ Page load time < 2s
- ✅ Mobile experience smooth
- ✅ Database integrity maintained
- ✅ Error handling graceful
- ✅ All edge cases handled

