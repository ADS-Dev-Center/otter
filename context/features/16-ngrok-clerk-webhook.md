# Feature 16: ngrok + Clerk Webhook Setup for Development

## Goals

Setup ngrok tunneling for development to enable Clerk webhooks to reach local development server. This allows testing webhook flows (user.created, user.updated, etc.) without deploying to production.

**Why ngrok instead of Svix/other solutions:**

- Simple one-command setup
- No additional authentication required
- Perfect for development testing
- URL structure is predictable
- Easy to transition to production (just change URL)

## Implementation Details

### Prerequisites

- macOS with Homebrew (or Linux/Windows equivalent)
- Clerk account with webhook endpoint configured
- Local dev server running on port 3000
- ngrok account (free tier available at https://ngrok.com)

### Setup Steps

#### 1. Install ngrok

```bash
# macOS (via Homebrew)
brew install ngrok

# Verify installation
ngrok version
```

#### 2. Authenticate ngrok (First Time Only)

```bash
# Go to https://ngrok.com and create free account
# Copy your auth token from dashboard

# Authenticate locally
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE

# Verify connection
ngrok http 3000
# Should show: "Account:xxxx | Version: 3.x.x"
```

#### 3. Start ngrok Tunnel

**In a new terminal window:**

```bash
# Start tunnel to port 3000
ngrok http 3000

# Output will show:
# Forwarding: https://abc123-def456.ngrok.io -> http://localhost:3000
# Copy the HTTPS URL (will be used in Clerk Dashboard)
```

#### 4. Update Clerk Webhook Endpoint

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to: **Webhooks** → Your endpoint
3. Update the URL to:
   ```
   https://abc123-def456.ngrok.io/api/webhooks/clerk
   ```
4. Keep the signing secret the same
5. Save changes

#### 5. Verify Webhook Configuration

In Clerk Dashboard, webhook endpoint should show:

- ✅ Status: Active
- ✅ Events: user.created, user.updated, user.deleted, session.\*, etc.
- ✅ URL: https://abc123-def456.ngrok.io/api/webhooks/clerk
- ✅ Secret: (should match CLERK_WEBHOOK_SIGNING_SECRET in .env)

### Development Workflow

```bash
# Terminal 1: Start dev server
npm run dev
# Runs at: http://localhost:3000

# Terminal 2: Start ngrok tunnel (NEW TERMINAL)
ngrok http 3000
# Generates URL: https://abc123.ngrok.io
# Copy this URL

# Terminal 3: Update webhook in Clerk Dashboard
# Webhooks → https://abc123.ngrok.io/api/webhooks/clerk

# Browser: Test sign-up flow
http://localhost:3000/sign-up
# Monitor Terminal 1 for webhook logs:
# [clerk-webhook] ===== WEBHOOK RECEIVED =====
# [clerk-webhook] ✅ Verification SUCCESSFUL
```

### Important Notes

#### URL Changes on Restart

- ⚠️ **ngrok generates new URL on each restart**
- After restarting ngrok, update Clerk webhook URL
- **Pro tip**: Use ngrok's paid tier for static URLs (or just update URL each time)

#### Webhook Verification

- All webhook requests are verified using `CLERK_WEBHOOK_SIGNING_SECRET`
- Ensure secret matches between:
  1. Clerk Dashboard (Webhooks → Signing Secret)
  2. `.env` file (`CLERK_WEBHOOK_SIGNING_SECRET`)
  3. Webhook handler uses `verifyWebhook(req)`

#### Common Issues

**Issue: "Verification failed" errors in logs**

```
Solution:
1. Verify CLERK_WEBHOOK_SIGNING_SECRET in .env matches Clerk Dashboard
2. Restart dev server after changing .env
3. Check ngrok URL matches in Clerk Dashboard
```

**Issue: Webhook URL unreachable from Svix**

```
Solution:
1. Verify ngrok tunnel is running
2. Check ngrok shows "Forwarding" status
3. Verify dev server is running on port 3000
4. Try: curl https://abc123.ngrok.io/api/webhooks/clerk (should respond)
```

**Issue: New user not appearing in database**

```
Solution:
1. Check webhook logs for errors
2. Verify user sync in webhook handler succeeded
3. Check database directly:
   SELECT * FROM "User" WHERE email = 'test@example.com';
4. Check DivisionMembership count after user creates division
```

## Webhook Handler

Webhook handler is located at: `app/api/webhooks/clerk/route.ts`

**Key functionality:**

- Verifies webhook signature using `verifyWebhook(req)`
- Syncs Clerk user data to local database on `user.created` and `user.updated`
- Deletes user from database on `user.deleted`
- Comprehensive logging for debugging

**Handler flow:**

```
Webhook Request (with signature headers)
    ↓
verifyWebhook(req) - Validates signature
    ↓
If valid → Process event (create/update/delete user)
    ↓
Log success/failure
    ↓
Return 200 OK
```

## Testing Checklist

- [ ] ngrok installed and authenticated
- [ ] ngrok tunnel running (`ngrok http 3000`)
- [ ] Clerk webhook endpoint URL updated to ngrok URL
- [ ] Dev server running (`npm run dev`)
- [ ] Browser clears cache (`Cmd+Shift+Delete`)
- [ ] Sign up with test account
- [ ] Server logs show `[clerk-webhook] ✅ Verification SUCCESSFUL`
- [ ] User appears in database after sign-up
- [ ] User redirects to `/onboarding` (not blank dashboard)
- [ ] User can create division
- [ ] After division created, redirects to `/dashboard` with data loaded

## Transition to Production

When deploying to production:

1. **No webhook handler changes needed** - code works as-is
2. **Only change webhook URL** in Clerk Dashboard:
   ```
   https://yourdomain.com/api/webhooks/clerk
   ```
3. **Verify CLERK_WEBHOOK_SIGNING_SECRET** is set in production environment
4. **Test webhook** by triggering events from Clerk Dashboard

## File Reference

- Webhook handler: `app/api/webhooks/clerk/route.ts`
- Environment variables: `.env`
  - `CLERK_WEBHOOK_SIGNING_SECRET` (from Clerk Dashboard)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Sign-up page: `app/sign-up/[[...sign-up]]/page.tsx`
  - `forceRedirectUrl="/onboarding"`
- App layout: `app/(app)/layout.tsx`
  - Checks `membershipCount` before allowing dashboard access
  - Redirects to `/onboarding` if count === 0

## It's Done When

- ✅ ngrok tunnel established and running
- ✅ Clerk webhook endpoint updated to ngrok URL
- ✅ User can sign up without blank page issue
- ✅ Webhook logs show successful verification
- ✅ User data synced to database automatically
- ✅ User redirects to onboarding (not dashboard)
- ✅ User can complete onboarding flow
- ✅ User has database record + division membership

## Related Features

- Feature 02: Auth setup with Clerk
- Feature 10: Onboarding division creation
- Feature 15: Member invite flow (uses webhook for event sync)
