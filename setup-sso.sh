#!/bin/bash

# SSO Boilerplate Setup Script

echo "🚀 Setting up SSO Boilerplate..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from environment.example..."
    cp environment.example .env
    echo "⚠️  Please update .env file with your configuration before running migrations"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Ask if user wants to run seeders
read -p "🌱 Do you want to run seeders? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Running seeders..."
    npm run seed
    echo "✅ Default admin user created:"
    echo "   Username: admin"
    echo "   Email: admin@sso-company.com"
    echo "   Password: password"
fi

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Set SSO_MODE to 'server' or 'client'"
echo "3. Configure database connection"
echo "4. Start the application with: npm start"
echo ""
echo "📚 For more information, see SSO_README.md"
