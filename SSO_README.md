# SSO Boilerplate Express

Boilerplate Express.js yang mendukung Single Sign-On (SSO) dengan kemampuan untuk berperan sebagai SSO Server atau SSO Client.

## Fitur

### SSO Server Mode
- OAuth2 Authorization Code Flow
- JWT Token Management
- User Authentication & Authorization
- Permission-based Access Control
- User Management System

### SSO Client Mode
- OAuth2 Client Implementation
- Token Validation
- User Session Management
- Automatic Redirect to SSO Server

### User Management System
- **Permissions**: Manajemen permission (create, read, update, delete)
- **Menus**: Manajemen menu dengan struktur hierarkis
- **Systems**: Manajemen sistem yang terintegrasi
- **Roles**: Manajemen role dengan permission assignment
- **Companies**: Manajemen perusahaan
- **Departments**: Manajemen departemen
- **Titles**: Manajemen jabatan
- **Employees**: Manajemen karyawan
- **Users**: Manajemen user dengan role assignment

## Instalasi

1. Clone repository
```bash
git clone <repository-url>
cd boilerplat-express
```

2. Install dependencies
```bash
npm install
```

3. Copy environment file
```bash
cp environment.example .env
```

4. Konfigurasi database dan environment variables di file `.env`

5. Jalankan migration
```bash
npm run migrate
```

6. Jalankan seeder (opsional)
```bash
npm run seed
```

7. Start aplikasi
```bash
npm start
```

## Konfigurasi SSO

### Environment Variables

```env
# SSO Configuration
SSO_MODE=server  # atau 'client'
SSO_SERVER_URL=http://localhost:3000
SSO_SERVER_SECRET=your_sso_server_secret_key
SSO_CLIENT_ID=your_client_id
SSO_CLIENT_SECRET=your_client_secret
SSO_REDIRECT_URI=http://localhost:3001/auth/sso/callback
SSO_AUTHORIZATION_URL=http://localhost:3000/auth/sso/authorize
SSO_TOKEN_URL=http://localhost:3000/auth/sso/token
SSO_USER_INFO_URL=http://localhost:3000/auth/sso/userinfo
```

### SSO Server Mode

Ketika `SSO_MODE=server`, aplikasi berperan sebagai SSO Server yang menyediakan:

- **Login Endpoint**: `/api/v1/auth/sso/login`
- **Authorization Endpoint**: `/api/v1/auth/sso/authorize`
- **Token Endpoint**: `/api/v1/auth/sso/token`
- **User Info Endpoint**: `/api/v1/auth/sso/userinfo`
- **Logout Endpoint**: `/api/v1/auth/sso/logout`

### SSO Client Mode

Ketika `SSO_MODE=client`, aplikasi berperan sebagai SSO Client yang:

- Redirect ke SSO Server untuk authentication
- Handle callback dari SSO Server
- Validate token dari SSO Server
- Manage user session

## API Endpoints

### Authentication

#### SSO Login (Server Mode)
```http
POST /api/v1/auth/sso/login
Content-Type: application/json

{
  "user_name": "admin",
  "user_password": "password",
  "client_id": "optional_client_id",
  "redirect_uri": "optional_redirect_uri"
}
```

#### SSO Authorization (OAuth2 Flow)
```http
GET /api/v1/auth/sso/authorize?client_id=client_id&redirect_uri=redirect_uri&response_type=code&state=state
```

#### SSO Token Exchange
```http
POST /api/v1/auth/sso/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "client_id": "client_id",
  "client_secret": "client_secret",
  "redirect_uri": "redirect_uri"
}
```

#### SSO User Info
```http
GET /api/v1/auth/sso/userinfo
Authorization: Bearer <access_token>
```

### User Management

#### Permissions
- `POST /api/v1/permissions` - Create permission
- `GET /api/v1/permissions` - List permissions
- `GET /api/v1/permissions/:id` - Get permission
- `PUT /api/v1/permissions/:id` - Update permission
- `DELETE /api/v1/permissions/:id` - Delete permission
- `POST /api/v1/permissions/:id/restore` - Restore permission

#### Menus
- `POST /api/v1/menus` - Create menu
- `GET /api/v1/menus` - List menus
- `GET /api/v1/menus/tree` - Get menu tree
- `GET /api/v1/menus/:id` - Get menu
- `PUT /api/v1/menus/:id` - Update menu
- `DELETE /api/v1/menus/:id` - Delete menu
- `POST /api/v1/menus/:id/restore` - Restore menu

#### Systems
- `POST /api/v1/systems` - Create system
- `GET /api/v1/systems` - List systems
- `GET /api/v1/systems/:id` - Get system
- `PUT /api/v1/systems/:id` - Update system
- `DELETE /api/v1/systems/:id` - Delete system
- `POST /api/v1/systems/:id/restore` - Restore system

#### Roles
- `POST /api/v1/roles` - Create role
- `GET /api/v1/roles` - List roles
- `GET /api/v1/roles/:id` - Get role
- `GET /api/v1/roles/:id/permissions` - Get role permissions
- `POST /api/v1/roles/:id/permissions` - Assign permissions to role
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `POST /api/v1/roles/:id/restore` - Restore role

#### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `GET /api/v1/users/:id/permissions` - Get user permissions
- `POST /api/v1/users/login` - User login
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/:id/restore` - Restore user
- `POST /api/v1/users/change-password` - Change password

## Database Schema

### Core Tables
- `permissions` - Permission definitions
- `menus` - Menu definitions with hierarchy
- `systems` - System definitions
- `roles` - Role definitions with hierarchy
- `companies` - Company definitions
- `departments` - Department definitions
- `titles` - Job title definitions
- `employees` - Employee information
- `users` - User accounts

### Relationship Tables
- `systemHasMenus` - System-Menu relationships
- `menuHasPermissions` - Menu-Permission relationships
- `roleHasMenuPermissions` - Role-Menu-Permission relationships

## Security Features

- Password hashing dengan bcrypt
- JWT token dengan expiration
- Permission-based access control
- Soft delete untuk data integrity
- Input validation dan sanitization
- Rate limiting
- CORS configuration

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

## Default Credentials

Setelah menjalankan seeder, default credentials:
- **Username**: admin
- **Email**: admin@sso-company.com
- **Password**: password

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License
