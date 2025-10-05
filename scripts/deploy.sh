#!/bin/bash

# Solana Tic-Tac-Toe Deployment Script
# This script deploys the entire application to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER=${1:-devnet}  # devnet or mainnet
DEPLOY_BACKEND=${DEPLOY_BACKEND:-true}
DEPLOY_FRONTEND=${DEPLOY_FRONTEND:-true}
DEPLOY_SOLANA=${DEPLOY_SOLANA:-true}

echo -e "${BLUE}🚀 Starting deployment to ${CLUSTER}...${NC}"

# Deploy Solana program
deploy_solana() {
    if [ "$DEPLOY_SOLANA" = "true" ]; then
        echo -e "${BLUE}🔗 Deploying Solana program to ${CLUSTER}...${NC}"
        
        cd solana
        
        # Set cluster
        if [ "$CLUSTER" = "mainnet" ]; then
            solana config set --url https://api.mainnet-beta.solana.com
        else
            solana config set --url https://api.devnet.solana.com
        fi
        
        # Check balance
        BALANCE=$(solana balance --output json | jq -r '.value')
        echo "💰 Current balance: ${BALANCE} SOL"
        
        if (( $(echo "$BALANCE < 2" | bc -l) )); then
            if [ "$CLUSTER" = "devnet" ]; then
                echo "💸 Requesting airdrop..."
                solana airdrop 2
            else
                echo -e "${RED}❌ Insufficient balance for mainnet deployment${NC}"
                exit 1
            fi
        fi
        
        # Build and deploy
        echo "🔨 Building program..."
        anchor build
        
        echo "🚀 Deploying to ${CLUSTER}..."
        anchor deploy --provider.cluster $CLUSTER
        
        # Extract program ID
        PROGRAM_ID=$(anchor keys list | grep "tic_tac_toe" | awk '{print $2}')
        echo "📝 Program ID: $PROGRAM_ID"
        
        # Update program ID in lib.rs
        sed -i.bak "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/tic_tac_toe/src/lib.rs
        
        # Update Anchor.toml
        if [ "$CLUSTER" = "mainnet" ]; then
            sed -i.bak "s/\[programs.mainnet\]/[programs.mainnet]\ntic_tac_toe = \"$PROGRAM_ID\"/" Anchor.toml
        else
            sed -i.bak "s/\[programs.devnet\]/[programs.devnet]\ntic_tac_toe = \"$PROGRAM_ID\"/" Anchor.toml
        fi
        
        cd ..
        echo -e "${GREEN}✅ Solana program deployed successfully${NC}"
        echo -e "${YELLOW}⚠️  Update PROGRAM_ID in backend and frontend configurations${NC}"
    fi
}

# Deploy backend to Railway
deploy_backend() {
    if [ "$DEPLOY_BACKEND" = "true" ]; then
        echo -e "${BLUE}🖥️  Deploying backend to Railway...${NC}"
        
        cd backend
        
        # Check if Railway CLI is available
        if ! command -v railway &> /dev/null; then
            echo -e "${RED}❌ Railway CLI not found. Please install it first:${NC}"
            echo "npm install -g @railway/cli"
            exit 1
        fi
        
        # Check if logged in
        if ! railway whoami &> /dev/null; then
            echo "🔐 Please login to Railway:"
            railway login
        fi
        
        # Deploy
        echo "🚀 Deploying to Railway..."
        railway up
        
        # Get deployment URL
        BACKEND_URL=$(railway domain)
        echo "🌐 Backend URL: $BACKEND_URL"
        
        cd ..
        echo -e "${GREEN}✅ Backend deployed successfully${NC}"
    fi
}

# Deploy frontend to Vercel
deploy_frontend() {
    if [ "$DEPLOY_FRONTEND" = "true" ]; then
        echo -e "${BLUE}🎨 Deploying frontend to Vercel...${NC}"
        
        cd frontend
        
        # Check if Vercel CLI is available
        if ! command -v vercel &> /dev/null; then
            echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
            echo "npm install -g vercel"
            exit 1
        fi
        
        # Deploy
        echo "🚀 Deploying to Vercel..."
        vercel --prod --yes
        
        cd ..
        echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
    fi
}

# Update configurations
update_configs() {
    echo -e "${BLUE}🔧 Updating configurations...${NC}"
    
    if [ -n "$PROGRAM_ID" ]; then
        echo "📝 Program ID found: $PROGRAM_ID"
        echo "Please update the following files:"
        echo "  - backend/.env (PROGRAM_ID)"
        echo "  - frontend/.env.local (NEXT_PUBLIC_PROGRAM_ID)"
        
        if [ -n "$BACKEND_URL" ]; then
            echo "  - frontend/.env.local (NEXT_PUBLIC_API_URL=$BACKEND_URL)"
        fi
    fi
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    
    # Check Solana program
    if [ "$DEPLOY_SOLANA" = "true" ] && [ -n "$PROGRAM_ID" ]; then
        echo "🔗 Checking Solana program..."
        if solana account $PROGRAM_ID &> /dev/null; then
            echo -e "${GREEN}✅ Solana program is deployed and accessible${NC}"
        else
            echo -e "${RED}❌ Solana program check failed${NC}"
        fi
    fi
    
    # Check backend
    if [ "$DEPLOY_BACKEND" = "true" ] && [ -n "$BACKEND_URL" ]; then
        echo "🖥️  Checking backend health..."
        if curl -f "$BACKEND_URL/health" &> /dev/null; then
            echo -e "${GREEN}✅ Backend is healthy and responding${NC}"
        else
            echo -e "${RED}❌ Backend health check failed${NC}"
        fi
    fi
    
    # Check frontend
    if [ "$DEPLOY_FRONTEND" = "true" ]; then
        echo "🎨 Frontend deployment verification completed"
        echo "Check Vercel dashboard for deployment status"
    fi
}

# Main deployment function
main() {
    echo -e "${BLUE}🎮 Solana Tic-Tac-Toe Deployment${NC}"
    echo "Cluster: $CLUSTER"
    echo "Deploy Solana: $DEPLOY_SOLANA"
    echo "Deploy Backend: $DEPLOY_BACKEND"  
    echo "Deploy Frontend: $DEPLOY_FRONTEND"
    echo ""
    
    # Confirm deployment
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    deploy_solana
    echo ""
    
    deploy_backend
    echo ""
    
    deploy_frontend
    echo ""
    
    update_configs
    echo ""
    
    verify_deployment
    echo ""
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📝 Post-deployment checklist:"
    echo "1. Update environment variables with new URLs/IDs"
    echo "2. Test complete game flow"
    echo "3. Monitor application logs"
    echo "4. Set up monitoring and alerts"
    echo ""
    echo -e "${GREEN}Your Solana Tic-Tac-Toe game is now live! 🎮${NC}"
}

# Handle script arguments
case $1 in
    --help|-h)
        echo "Usage: $0 [CLUSTER] [OPTIONS]"
        echo ""
        echo "CLUSTER:"
        echo "  devnet    Deploy to Solana devnet (default)"
        echo "  mainnet   Deploy to Solana mainnet"
        echo ""
        echo "Environment variables:"
        echo "  DEPLOY_SOLANA=false    Skip Solana program deployment"
        echo "  DEPLOY_BACKEND=false   Skip backend deployment"
        echo "  DEPLOY_FRONTEND=false  Skip frontend deployment"
        echo ""
        echo "Examples:"
        echo "  $0                           # Deploy everything to devnet"
        echo "  $0 mainnet                   # Deploy everything to mainnet"
        echo "  DEPLOY_SOLANA=false $0       # Deploy only backend and frontend"
        exit 0
        ;;
    devnet|mainnet)
        main
        ;;
    "")
        main
        ;;
    *)
        echo -e "${RED}❌ Invalid cluster: $1${NC}"
        echo "Use 'devnet' or 'mainnet', or run with --help for usage"
        exit 1
        ;;
esac