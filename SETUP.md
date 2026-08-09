# Getting this running on your machine

## 1. Install dependencies
```
pnpm install
```
Note: pnpm blocks postinstall scripts by default. If you see an
"Ignored build scripts" warning, `pnpm-workspace.yaml` already has
Prisma's scripts pre-approved (`allowBuilds`), so a second
`pnpm install` will pick it up.

## 2. Set up your database
1. Go to supabase.com, create a free project
2. Project Settings -> Database -> Connection string (URI, "Transaction" pooler mode)
3. Paste it into `.env` as DATABASE_URL

## 3. Generate the Prisma client and create your tables
```
pnpm prisma generate
pnpm prisma migrate dev --name init
```

## 4. Add your Paystack test secret key
Get it from your Paystack dashboard (Settings -> API Keys & Webhooks, test mode).
We'll use this in the next step when we build the webhook receiver and seed script.

## 5. Run the dev server
```
pnpm dev
```
Visit http://localhost:3000
