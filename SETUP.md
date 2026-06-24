# JobPilot - Setup Guide

## Environment Variables Required

Add these to your Vercel project settings under **Settings → Environment Variables**:

### Required
```
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_random_32_char_secret
```

### For Cron Scheduling (Automated Scraping)
```
CRON_SECRET=your_random_cron_secret
```

### AI Gateway (Optional - defaults to Vercel AI Gateway)
```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key  # Only if using direct Google API
```

## Setup Steps

### 1. Database Setup
- Neon database tables are automatically created via SQL migrations
- All tables include user scoping for security

### 2. Authentication
- Generate BETTER_AUTH_SECRET: `openssl rand -base64 32`
- Add to environment variables
- Users can sign up at `/sign-up`

### 3. Upload Your Resumes
1. Sign in to your account
2. Go to "My Resumes"
3. Upload your 9 role-specific resumes (PDF/TXT/DOCX)
4. Supported roles:
   - Software Engineer
   - Full Stack Developer
   - DevOps / Cloud Engineer
   - Data Scientist
   - Data Analyst
   - AI/ML Engineer
   - Cybersecurity Engineer
   - Associate Product Manager

### 4. Scrape Jobs Manually
1. Click "Scrape Jobs" from dashboard
2. System scrapes from:
   - Indeed (India & UAE)
   - Naukri
   - Bayt
   - Unstop
   - Wellfound
   - Company career pages
3. Select jobs to add to your pending list

### 5. Review & Apply
1. Dashboard shows top 5 matches
2. For each job:
   - Click "Generate & Review" to create AI cover letter
   - Review the generated letter
   - Click "Apply Now" to submit
3. All applications tracked in "Recent Applications"

## Automated Scheduling (Cron Jobs)

JobPilot includes automated job scraping every 6 hours:

```
Schedule: Every 6 hours (0 */6 * * *)
Endpoint: /api/cron/scrape
```

To enable:
1. Deploy to Vercel
2. Add `CRON_SECRET` to environment variables
3. Cron jobs automatically run every 6 hours
4. All new matching jobs (score >= 50) added to your pending list

## Job Matching Algorithm

The system uses Gemini AI to:
1. Analyze job requirements
2. Match against your uploaded resumes
3. Score matches 0-100
4. Only add jobs with 50+ match score
5. Recommend best resume for each job

## Cost Breakdown

| Service | Cost | Limit |
|---------|------|-------|
| Neon PostgreSQL | FREE | 3GB storage, 1 project |
| Google Gemini API | FREE | 15 req/min |
| Vercel Hosting | FREE | 100GB bandwidth/month |
| Playwright (Scraping) | FREE | Unlimited |
| Better Auth | FREE | Unlimited users |
| **TOTAL** | **$0** | - |

## Troubleshooting

### Jobs not scraping?
- Check that Playwright is installed: `pnpm list playwright`
- Verify job board websites are accessible
- Check console logs for errors

### Cover letters not generating?
- Verify GOOGLE_GENERATIVE_AI_API_KEY is set (if using direct API)
- Check Gemini API quotas (15 req/min free tier)
- Resume must be uploaded for the detected job role

### Applications not tracking?
- Verify DATABASE_URL is set correctly
- Check Neon database tables are created
- Ensure BETTER_AUTH_SECRET is configured

## API Routes

- `GET/POST /api/auth/[...all]` - Authentication endpoints
- `POST /api/scrape` - Manual job scraping
- `POST /api/add-jobs` - Add scraped jobs with matching
- `GET /api/cron/scrape` - Automated cron job (requires CRON_SECRET)

## File Structure

```
app/
  api/
    auth/[...all]/route.ts    - Better Auth handler
    scrape/route.ts           - Manual scraping API
    add-jobs/route.ts         - Job matching & adding
    cron/scrape/route.ts      - Scheduled scraping
  dashboard/
    page.tsx                  - Main dashboard
    resumes/page.tsx          - Resume management
    scrape/page.tsx           - Job scraping interface
  sign-in/page.tsx            - Sign in page
  sign-up/page.tsx            - Sign up page
  page.tsx                    - Home page

lib/
  auth.ts                     - Better Auth config
  auth-client.ts              - Auth client
  ai.ts                       - Gemini AI functions
  db/
    index.ts                  - Drizzle setup
    schema.ts                 - Database schema
  scrapers/index.ts           - Job scrapers

components/
  job-card.tsx                - Job display & apply
  applications-list.tsx       - Application history
```

## Support

For issues:
1. Check the console logs
2. Verify all environment variables are set
3. Check Neon database connection
4. Verify Gemini API is accessible
