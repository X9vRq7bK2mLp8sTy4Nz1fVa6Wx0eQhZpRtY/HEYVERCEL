# Vercel Deployment Guide

## Pre-Deployment Build

Before deploying to Vercel, you need to build the project locally:

```bash
npm run build
```

This will:
1. Build the frontend React app to `dist/public/` (static HTML, CSS, JS)
2. Bundle the backend Express server to `dist/index.js` (single Node.js file)

## Vercel Configuration

The `vercel.json` file is already configured with:
- Static file serving from `dist/public/`
- Node.js serverless function for the backend API
- Proper routing for SPA and API endpoints

## Deployment Steps

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy to Vercel:
```bash
vercel --prod
```

The CLI will automatically:
- Upload the `dist/` directory
- Configure the deployment using `vercel.json`
- Set up the domain and SSL

### Option 2: Vercel Git Integration

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import the project in Vercel Dashboard:
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will detect the `vercel.json` configuration

3. Configure build settings (if needed):
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Deploy!

## Environment Variables

Set the following environment variables in Vercel Dashboard:

- `SESSION_SECRET`: A secure random string for session encryption
  ```bash
  # Generate one with:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Post-Deployment

After deployment:
1. Your frontend will be available at `https://your-app.vercel.app`
2. API endpoints will be at `https://your-app.vercel.app/api/*`
3. Test the raw script endpoint with an executor (not browser)

## Important Notes

- ✅ All builds happen locally - Vercel just serves pre-built files
- ✅ No dependencies need to be installed on Vercel
- ✅ The backend is bundled as a single file with all dependencies
- ✅ Frontend is optimized static files (HTML, CSS, JS)

## Testing Raw Script Access

The `/api/raw/:loaderLink` endpoint requires:
1. Non-browser User-Agent (executor)
2. Custom header: `X-LuaShield-Executor: LuaShield-Executor-v1`
3. Valid loader link from a protected script

Test with curl (will be rejected):
```bash
# This will fail (browser-like User-Agent)
curl https://your-app.vercel.app/api/raw/YOUR_LOADER_LINK

# This will work (executor-like User-Agent)
curl -H "User-Agent: Synapse X" \
     -H "X-LuaShield-Executor: LuaShield-Executor-v1" \
     https://your-app.vercel.app/api/raw/YOUR_LOADER_LINK
```

## Troubleshooting

### 404 on API routes
- Check that `dist/index.js` exists after build
- Verify `vercel.json` routes configuration

### Session issues
- Ensure `SESSION_SECRET` environment variable is set
- Check that cookies are being sent with requests

### Executor access denied
- Verify User-Agent header is not browser-like
- Ensure custom header `X-LuaShield-Executor` is present
- Check that the loader link is valid

## Production Considerations

For production deployment, consider:

1. **Database**: Currently using in-memory storage. Migrate to a persistent database (PostgreSQL, MongoDB) for production
2. **Session Store**: Use Redis or database-backed sessions instead of memory store
3. **Rate Limiting**: Add rate limiting middleware to prevent abuse
4. **HTTPS**: Enabled by default on Vercel
5. **Monitoring**: Set up error tracking (Sentry, LogRocket, etc.)
6. **Backups**: Regular backups if using persistent storage
