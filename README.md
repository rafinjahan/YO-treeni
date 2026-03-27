# YO-Treeni Deployment & Configuration

This guide provides step-by-step instructions to take the YO-Treeni MVP from local development to a live Vercel production environment with full Google Authentication.

## 1. Configuring Google OAuth (Supabase)
To allow students to log in with their Google accounts:
1. Go to your **Supabase Project Dashboard** -> **Authentication** -> **Providers**.
2. Enable **Google**.
3. You will need a **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
4. In Google Cloud, set the **Authorized Redirect URI** exactly to your Supabase callback:
   `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
5. Back in Supabase **Authentication** -> **URL Configuration**, add your live Vercel domain to the **Redirect URLs** list (e.g., `https://my-yotreeni.vercel.app/**`).

## 2. Deploying to Vercel
Since this is a standard Next.js 14 project, Vercel will auto-detect everything.
1. Create a GitHub repository and push your local code.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. **Environment Variables**: You MUST copy all values from your `.env.local` file and paste them into the Vercel deployment settings BEFORE clicking Deploy!
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `OPENAI_MODEL`
5. Click **Deploy**. Vercel will output a default `.vercel.app` domain.

## 3. Custom Domain Setup
When you are ready to use a custom `.fi` domain:
1. In your Vercel Project Dashboard, click **Settings** -> **Domains**.
2. Type in your registered domain name (e.g. `yotreeni.fi`) and click Add.
3. Vercel will provide you with DNS Records (usually an `A` record pointing to `76.76.21.21`).
4. Log into your domain registrar and paste the DNS records into their management portal.
5. Vercel will automatically configure a free SSL certificate once the domain matches!
