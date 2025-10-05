#!/bin/bash

# Solana Tic-Tac-Toe Setup Script
# This script sets up the development environment for the entire project

set -e

echo "🎮 Setting up Solana Tic-Tac-Toe development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
        exit 1
    fi
    
    # Check if Docker is available (optional)
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker is available${NC}"
        DOCKER_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠️  Docker is not available. Some features may be limited.${NC}"
        DOCKER_AVAILABLE=false
    fi
    
    echo -e "${GREEN}✅ Requirements check completed${NC}"
}

# Setup Solana program
setup_solana() {
    echo "🔗 Setting up Solana program..."
    
    cd solana
    
    # Install dependencies
    if [ -f "package.json" ]; then
        echo "📦 Installing Solana program dependencies..."
        npm install
    fi
    
    # Check if Anchor is available
    if command -v anchor &> /dev/null; then
        echo "🔨 Building Solana program..."
        anchor build || echo -e "${YELLOW}⚠️  Anchor build failed. Make sure Anchor CLI is installed.${NC}"
    else
        echo -e "${YELLOW}⚠️  Anchor CLI not found. Please install Anchor to build the Solana program.${NC}"
        echo "Install with: npm install -g @coral-xyz/anchor-cli"
    fi
    
    cd ..
    echo -e "${GREEN}✅ Solana program setup completed${NC}"
}

# Setup backend
setup_backend() {
    echo "🖥️  Setting up backend..."
    
    cd backend
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Create environment file
    if [ ! -f ".env" ]; then
        echo "🔧 Creating backend environment file..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
    fi
    
    # Build TypeScript
    echo "🔨 Building backend..."
    npm run build
    
    cd ..
    echo -e "${GREEN}✅ Backend setup completed${NC}"
}

# Setup frontend
setup_frontend() {
    echo "🎨 Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Create environment file
    if [ ! -f ".env.local" ]; then
        echo "🔧 Creating frontend environment file..."
        cp .env.example .env.local
        echo -e "${YELLOW}⚠️  Please update frontend/.env.local with your configuration${NC}"
    fi
    
    # Build Next.js app
    echo "🔨 Building frontend..."
    npm run build
    
    cd ..
    echo -e "${GREEN}✅ Frontend setup completed${NC}"
}

# Setup database with Docker
setup_database() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo "🗄️  Setting up database with Docker..."
        
        # Check if docker-compose is available
        if command -v docker-compose &> /dev/null; then
            echo "🐳 Starting PostgreSQL with Docker Compose..."
            docker-compose up -d postgres
            echo -e "${GREEN}✅ Database started with Docker Compose${NC}"
        else
            echo "🐳 Starting PostgreSQL with Docker..."
            docker run -d \
                --name tic-tac-toe-postgres \
                -e POSTGRES_DB=tic_tac_toe \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=password \
                -p 5432:5432 \
                postgres:15-alpine
            echo -e "${GREEN}✅ Database started with Docker${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Docker not available. Please set up PostgreSQL manually.${NC}"
        echo "Database URL: postgresql://postgres:password@localhost:5432/tic_tac_toe"
    fi
}

# Main setup function
main() {
    echo "🚀 Starting Solana Tic-Tac-Toe setup..."
    echo ""
    
    check_requirements
    echo ""
    
    setup_solana
    echo ""
    
    setup_backend
    echo ""
    
    setup_frontend
    echo ""
    
    setup_database
    echo ""
    
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update environment variables in:"
    echo "   - backend/.env"
    echo "   - frontend/.env.local"
    echo ""
    echo "2. Deploy Solana program (if Anchor is available):"
    echo "   cd solana && anchor deploy --provider.cluster devnet"
    echo ""
    echo "3. Start development servers:"
    echo "   # Backend"
    echo "   cd backend && npm run dev"
    echo ""
    echo "   # Frontend"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "4. Or use Docker Compose:"
    echo "   docker-compose up"
    echo ""
    echo -e "${GREEN}Happy coding! 🎮${NC}"
}

# Run main function
main