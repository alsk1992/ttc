# Solana Tic-Tac-Toe Deployment Guide

## Railway Deployment

This application consists of two services that need to be deployed separately:

### Backend Service

1. Create a new Railway service for the backend
2. Connect your GitHub repository
3. Set the root directory to `/backend`
4. Configure environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   PORT=3001
   FRONTEND_URL=https://your-frontend-service.railway.app
   NODE_ENV=production
   ```

5. The backend will be accessible at: `https://your-backend-service.railway.app`

### Frontend Service

1. Create a new Railway service for the frontend
2. Connect your GitHub repository
3. Set the root directory to `/frontend`
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
   NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_PROGRAM_ID=your_production_program_id
   ```

5. The frontend will be accessible at: `https://your-frontend-service.railway.app`

## Database Setup

The backend requires a PostgreSQL database. You can:

1. Add a PostgreSQL database in Railway
2. Copy the connection string to `DATABASE_URL`
3. The backend will automatically create tables on startup

## Troubleshooting

### API Connection Issues

If you see 404 errors for API endpoints:

1. Check that `NEXT_PUBLIC_API_URL` is set correctly in frontend
2. Verify the backend service is running (check `/health` endpoint)
3. Ensure CORS is configured correctly (check `FRONTEND_URL` in backend)

### WebSocket Connection Issues

If real-time updates aren't working:

1. Check browser console for WebSocket errors
2. Verify the backend URL is correct
3. Ensure your hosting supports WebSocket connections

### Automatic URL Detection

If you haven't set `NEXT_PUBLIC_API_URL`, the frontend will try to auto-detect the backend URL by replacing `-frontend-` with `-backend-` in Railway URLs. This is a fallback - always set the environment variable for production.

## Local Development

For local development, the defaults will work:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

Just run:
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Health Check

You can verify the backend is running by visiting:
```
https://your-backend-service.railway.app/health
```

This should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```