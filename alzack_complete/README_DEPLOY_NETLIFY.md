Alzack - Deploy to Netlify (Fullstack)

1. Replace dummy keys in .env or, better, set them in Netlify Site Settings -> Environment Variables.
   - DATABASE_URL (Postgres connection string)
   - JWT_SECRET
   - OPENAI_API_KEY
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_RHASSPY_URL

2. Push this repo to GitHub.

3. On Netlify:
   - New site -> Import from Git -> select repo
   - Build command: npm run build
   - Publish directory: .next

Important: For production use a hosted Postgres (Supabase/Neon). SQLite is not recommended on Netlify.
