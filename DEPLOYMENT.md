# Deployment Guide

Complete deployment guide for the Solana Tic-Tac-Toe application across all three components.

## Prerequisites

- Node.js 18+
- Solana CLI
- Anchor CLI (0.30.1+)
- PostgreSQL database
- Railway account (for backend)
- Vercel account (for frontend)

## 1. Solana Program Deployment

### Development (Devnet)

1. **Install Anchor and Solana CLI**
   ```bash
   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
   
   # Install Anchor
   npm install -g @coral-xyz/anchor-cli@0.30.1
   ```

2. **Configure Solana**
   ```bash
   # Set to devnet
   solana config set --url https://api.devnet.solana.com
   
   # Create keypair (if needed)
   solana-keygen new --outfile ~/.config/solana/id.json
   
   # Get devnet SOL
   solana airdrop 2
   ```

3. **Deploy Program**
   ```bash
   cd solana
   
   # Build program
   anchor build
   
   # Deploy to devnet
   anchor deploy --provider.cluster devnet
   
   # Note the program ID from deployment output
   ```

4. **Update Program ID**
   After deployment, update the program ID in:
   - `solana/programs/tic_tac_toe/src/lib.rs` (declare_id! macro)
   - `solana/Anchor.toml` (programs.devnet section)
   - `backend/.env` (PROGRAM_ID)
   - `frontend/.env.local` (NEXT_PUBLIC_PROGRAM_ID)

### Production (Mainnet)

1. **Switch to Mainnet**
   ```bash
   solana config set --url https://api.mainnet-beta.solana.com
   
   # Ensure you have enough SOL for deployment (~2-5 SOL)
   solana balance
   ```

2. **Deploy to Mainnet**
   ```bash
   cd solana
   anchor deploy --provider.cluster mainnet
   ```

3. **Update Configurations**
   Update program ID in all relevant files for mainnet deployment.

## 2. Backend Deployment (Railway)

### Database Setup

1. **Create PostgreSQL Database**
   ```bash
   # Via Railway dashboard or CLI
   railway login
   railway init
   railway add postgresql
   ```

2. **Get Database URL**
   ```bash
   railway variables
   # Copy DATABASE_URL value
   ```

### Application Deployment

1. **Prepare Environment Variables**
   Create production environment variables in Railway:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL=your_postgresql_url
   railway variables set SOLANA_RPC_URL=https://api.devnet.solana.com
   railway variables set PROGRAM_ID=your_deployed_program_id
   railway variables set FRONTEND_URL=your_frontend_domain
   railway variables set PORT=3001
   ```

2. **Deploy via Railway**
   ```bash
   cd backend
   
   # Deploy to Railway
   railway up
   
   # Or connect via GitHub
   # Push to repository and connect in Railway dashboard
   ```

3. **Verify Deployment**
   ```bash
   # Check deployment status
   railway status
   
   # View logs
   railway logs
   
   # Test health endpoint
   curl https://your-backend-url.railway.app/health
   ```

### Database Migration

Railway will automatically run the database initialization on first startup. The tables are created via the `initializeDatabase()` function in `src/services/database.ts`.

## 3. Frontend Deployment (Vercel)

### Environment Setup

1. **Create Environment Variables**
   In Vercel dashboard or via CLI:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=your_deployed_program_id
   ```

### Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Application**
   ```bash
   cd frontend
   
   # Deploy to Vercel
   vercel --prod
   ```

3. **Configure Custom Domain** (Optional)
   ```bash
   vercel domains add your-domain.com
   vercel domains ls
   ```

### Deploy via GitHub

1. **Connect Repository**
   - Push code to GitHub repository
   - Connect repository in Vercel dashboard
   - Configure build settings:
     - Framework: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

2. **Set Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables

## 4. Complete Deployment Checklist

### Pre-deployment

- [ ] Test all components locally
- [ ] Ensure environment variables are configured
- [ ] Database schema is ready
- [ ] Solana program is tested on devnet

### Solana Program

- [ ] Deploy program to devnet
- [ ] Test program functionality
- [ ] Update program ID in all configurations
- [ ] Deploy to mainnet (production)

### Backend

- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Deploy to Railway
- [ ] Verify API endpoints
- [ ] Test WebSocket connections
- [ ] Test Solana integration

### Frontend

- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test wallet connections
- [ ] Verify API integration
- [ ] Test real-time features
- [ ] Configure custom domain

### Post-deployment

- [ ] Monitor application logs
- [ ] Test complete game flow
- [ ] Verify betting functionality
- [ ] Check error handling
- [ ] Monitor performance metrics

## 5. Environment Variables Reference

### Solana Program
```bash
# .env in solana/
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
PROGRAM_ID=your_program_id
```

### Backend
```bash
# Railway environment variables
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=your_program_id
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend
```bash
# Vercel environment variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

## 6. Monitoring and Maintenance

### Backend Monitoring
```bash
# Railway logs
railway logs --tail

# Health check
curl https://your-backend.railway.app/health
```

### Frontend Monitoring
- Vercel dashboard analytics
- Error tracking via console
- Performance monitoring

### Database Monitoring
- Railway database metrics
- Query performance
- Connection pool status

## 7. Troubleshooting

### Common Issues

1. **Program Deployment Fails**
   - Check Solana CLI version
   - Ensure sufficient SOL balance
   - Verify network configuration

2. **Backend Deployment Issues**
   - Check environment variables
   - Verify database connectivity
   - Review Railway logs

3. **Frontend Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Review Vercel build logs

4. **CORS Issues**
   - Update FRONTEND_URL in backend
   - Check CORS configuration
   - Verify domain settings

### Performance Optimization

1. **Database**
   - Enable connection pooling
   - Add database indexes
   - Optimize queries

2. **Backend**
   - Enable gzip compression
   - Implement caching
   - Monitor response times

3. **Frontend**
   - Optimize bundle size
   - Enable image optimization
   - Implement lazy loading

## 8. Scaling Considerations

### Backend Scaling
- Horizontal scaling via Railway
- Database connection pooling
- Redis for session storage

### Frontend Scaling
- CDN distribution via Vercel
- Static page generation
- Image optimization

### Database Scaling
- Read replicas
- Connection pooling
- Query optimization

## 9. Security Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Error messages sanitized

## 10. Backup and Recovery

### Database Backups
```bash
# Railway provides automated backups
# Manual backup
railway run pg_dump DATABASE_URL > backup.sql
```

### Code Backups
- Git repository with tags
- Environment variable backups
- Configuration backups

## Success Criteria

Deployment is successful when:
1. ✅ Solana program is deployed and functional
2. ✅ Backend API is responding to all endpoints
3. ✅ Frontend loads and connects to wallet
4. ✅ Users can create and join games
5. ✅ Real-time updates work correctly
6. ✅ Betting system functions properly
7. ✅ All error cases are handled gracefully