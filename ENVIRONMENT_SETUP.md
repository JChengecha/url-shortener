# Environment Variable Setup Guide for URL Shortener

## Prerequisites
- Vercel Account
- Vercel KV Database
- NextAuth Setup

## Environment Variables Checklist

### 1. Vercel KV Database Variables
- `KV_REST_API_URL`: Your Vercel KV database REST API URL
- `KV_REST_API_TOKEN`: Authentication token for KV database
- `KV_URL`: Connection URL for Vercel KV database

#### How to Obtain:
1. Go to Vercel Dashboard
2. Navigate to Project Settings
3. Select "KV Stores"
4. Create a new KV database or use an existing one
5. Copy the REST API URL, Token, and Connection URL

### 2. NextAuth Configuration
- `NEXTAUTH_SECRET`: A long, random string used to encrypt tokens
- `NEXTAUTH_URL`: Your application's base URL

#### Generating NEXTAUTH_SECRET:
```bash
# Run in terminal
openssl rand -base64 32
```

### 3. Application Base URL
- `NEXT_PUBLIC_BASE_URL`: Your application's public-facing URL

## Local Development Setup

1. Copy `.env.example` to `.env.local`
```bash
cp .env.example .env.local
```

2. Fill in the variables in `.env.local`

## Vercel Deployment Environment Variables

1. Go to Vercel Project Settings
2. Navigate to "Environment Variables"
3. Add each variable from `.env.example`
4. Set appropriate scopes:
   - Development
   - Preview
   - Production

## Security Best Practices

1. Never commit `.env.local` to version control
2. Use strong, unique secrets
3. Rotate secrets periodically
4. Limit access to environment variables

## Troubleshooting

- Verify variables are correctly set
- Check Vercel logs for configuration errors
- Ensure all required variables are present

## Optional: Additional Services

- GitHub/Google OAuth
- Monitoring (Sentry)
- Email Services

### Example OAuth Setup
1. Create OAuth App in GitHub/Google Developer Console
2. Obtain Client ID and Client Secret
3. Add to environment variables

## Verification Script

Create a script to verify environment setup:

```typescript
// utils/env-check.ts
function checkEnvVariables() {
  const requiredVars = [
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_BASE_URL'
  ]

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`Missing required environment variable: ${varName}`)
      process.exit(1)
    }
  })

  console.log('Environment variables check passed!')
}

checkEnvVariables()
```

## Support

If you encounter any issues, please open a GitHub issue with:
- Detailed description
- Environment details
- Relevant logs (sanitized)
