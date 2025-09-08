# SSO Client System

Sistem client SSO (Single Sign-On) yang dibangun dengan Express.js untuk mengintegrasikan aplikasi dengan server SSO menggunakan protokol OAuth2/OIDC.

## Fitur Utama

- ✅ **OAuth2/OIDC Client**: Implementasi lengkap OAuth2 dan OpenID Connect client
- ✅ **JWT Authentication**: Token-based authentication dengan JWT
- ✅ **Session Management**: Manajemen session pengguna yang aman
- ✅ **Client Registration**: Registrasi dan manajemen client aplikasi
- ✅ **Scope Management**: Manajemen scope dan permission
- ✅ **User Management**: CRUD operasi untuk user
- ✅ **Database Migration**: Knex.js untuk PostgreSQL dengan migration dan seeder
- ✅ **Security**: Rate limiting, CORS, dan proteksi keamanan lainnya
- ✅ **Docker Support**: Containerization untuk development dan production

## Struktur Proyek

```
├── src/
│   ├── config/           # Konfigurasi database, AWS, dll
│   ├── modules/          # Business logic modules
│   │   ├── auth/         # Module autentikasi
│   │   ├── sso/          # Module SSO client
│   │   ├── users/        # Module user management
│   │   └── helpers/      # Utility functions
│   ├── middlewares/      # Custom middlewares
│   ├── routes/          # API routes
│   ├── repository/      # Database layer
│   │   └── postgres/    # PostgreSQL migrations & seeders
│   ├── utils/           # Helper utilities
│   ├── static/          # Swagger documentation
│   ├── templates/       # Email templates
│   ├── views/          # View templates
│   ├── listeners/      # RabbitMQ listeners
│   ├── scripts/        # Background scripts
│   └── debug/          # Debug utilities
├── docker/             # Docker configurations
├── public/            # Static files
└── logs/              # Application logs
```

## Getting Started

### Prerequisites

- Node.js (v14 atau lebih baru)
- PostgreSQL
- Redis (opsional, untuk session storage)

### Installation

1. Clone repository:
```bash
git clone <repository-url>
cd report-management
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp environment.example .env
# Edit .env sesuai konfigurasi Anda
```

4. Setup database:
```bash
# Jalankan migrasi
npm run migrate

# Jalankan seeder
npm run seed
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### SSO Authentication
- `POST /api/v1/auth/sso/login` - Login dengan SSO
- `GET /api/v1/auth/sso/authorize` - Authorization endpoint
- `POST /api/v1/auth/sso/token` - Token endpoint
- `GET /api/v1/auth/sso/userinfo` - User info endpoint
- `GET /api/v1/auth/sso/callback` - Callback endpoint
- `POST /api/v1/auth/sso/logout` - Logout

### Client Management
- `POST /api/v1/auth/sso/clients` - Register client
- `GET /api/v1/auth/sso/clients` - List clients
- `GET /api/v1/auth/sso/clients/:id` - Get client
- `PUT /api/v1/auth/sso/clients/:id` - Update client
- `DELETE /api/v1/auth/sso/clients/:id` - Delete client

### Session Management
- `GET /api/v1/auth/sso/sessions/:id` - Get session info
- `GET /api/v1/auth/sso/sessions/user/:user_id` - Get user sessions
- `POST /api/v1/auth/sso/sessions/:id/end` - End session

### User Management
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/change-password` - Change password

## Database Schema

### Core Tables
- `users` - User accounts
- `sso_clients` - SSO client registrations
- `sso_authorization_codes` - OAuth2 authorization codes
- `sso_token_blacklist` - Token blacklist
- `sso_sessions` - User sessions

## Security Features

- Password hashing dengan bcrypt
- JWT token dengan expiration
- OAuth2/OIDC compliance
- Session management
- Rate limiting
- CORS configuration
- Input validation dan sanitization

## Development

### Running Tests
```bash
npm test
```

### Running Migrations
```bash
npm run migrate
```

### Running Seeders
```bash
npm run seed
```

### Development Mode
```bash
npm run dev
```

## Docker

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f docker-compose.server.yml up
```

## License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## Contributing

Lihat file [CONTRIBUTORS.md](CONTRIBUTORS.md) untuk daftar kontributor.

## Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.