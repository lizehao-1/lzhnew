# Ops Guide

## D1: Credit Management

Add credits for specific phones (strong consistency, production):

```bash
npx wrangler d1 execute mbti --remote --command "INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES ('18947108008','',100000, strftime('%s','now')*1000, strftime('%s','now')*1000),('13314890606','',100000, strftime('%s','now')*1000, strftime('%s','now')*1000),('13804710699','',100000, strftime('%s','now')*1000, strftime('%s','now')*1000),('18847189876','',100000, strftime('%s','now')*1000, strftime('%s','now')*1000) ON CONFLICT(phone) DO UPDATE SET credits = users.credits + 100000, updated_at = excluded.updated_at;"
```

Set an exact credit balance:

```bash
npx wrangler d1 execute mbti --remote --command "UPDATE users SET credits = 10, updated_at = strftime('%s','now')*1000 WHERE phone = '13804710699';"
```

Get a user's credits:

```bash
npx wrangler d1 execute mbti --remote --command "SELECT phone, credits, updated_at FROM users WHERE phone = '13804710699';"
```

Batch add for a file of phones (PowerShell):

```powershell
$phones = @('18947108008','13314890606','13804710699','18847189876')
$values = $phones | ForEach-Object { "('$_','',100000, strftime('%s','now')*1000, strftime('%s','now')*1000)" }
$sql = "INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES " + ($values -join ',') + " ON CONFLICT(phone) DO UPDATE SET credits = users.credits + 100000, updated_at = excluded.updated_at;"
npx wrangler d1 execute mbti --remote --command $sql
```

## Admin API (optional)

Requires `ADMIN_KEY` environment variable set in Cloudflare Pages.

```bash
curl -X POST "https://<your-domain>/api/admin/add-credits" \
  -H "Content-Type: application/json" \
  -d '{"phone":"13804710699","credits":100000,"adminKey":"<ADMIN_KEY>"}'
```

