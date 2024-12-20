# URL Shortener

## Overview
A modern, full-featured URL shortening application with advanced analytics and tracking.

## Features
- 🔗 Create short, memorable URLs
- 📊 Detailed click analytics
- 🌍 Geographic tracking
- 🔒 Secure authentication
- 📱 Responsive design

## Prerequisites
- Node.js 18+
- npm 9+
- Vercel KV (for database)
- NextAuth configuration

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
NEXTAUTH_SECRET=
VERCEL_KV_REST_API_URL=
VERCEL_KV_REST_API_TOKEN=
```

4. Run the development server
```bash
npm run dev
```

## Deployment
Recommended platforms: Vercel, Netlify

## Technologies
- Next.js 14
- TypeScript
- Tailwind CSS
- NextAuth
- Vercel KV
- Recharts

## License
MIT License
