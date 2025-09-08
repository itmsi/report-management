# Report Management SSO Client Setup

Dokumentasi setup untuk sistem Report Management sebagai SSO Client.

## Konfigurasi Environment

File `.env` telah dikonfigurasi dengan spesifikasi berikut:

### Application Configuration
- **Nama Aplikasi**: Report Management
- **Port**: 9581
- **Environment**: development

### Database Configuration
- **Host**: localhost
- **Port**: 5432
- **Username**: falaqmsi
- **Password**: Rubysa179596
- **Database**: report_management

### SSO Client Configuration
- **Client ID**: report-management-client
- **Client Secret**: report-management-client-secret-change-in-production
- **Redirect URI**: http://localhost:9581/api/v1/auth/sso/callback
- **Scopes**: read,write,profile,email

### SSO Server Configuration
- **Server URL**: http://localhost:9588
- **Authorization URL**: http://localhost:9588/api/v1/auth/sso/authorize
- **Token URL**: http://localhost:9588/api/v1/auth/sso/token
- **UserInfo URL**: http://localhost:9588/api/v1/auth/sso/userinfo
- **Logout URL**: http://localhost:9588/api/v1/auth/sso/logout

## Setup Database

1. **Buat database PostgreSQL**:
```sql
CREATE DATABASE report_management;
```

2. **Jalankan migrasi**:
```bash
npm run migrate
```

3. **Jalankan seeder**:
```bash
npm run seed
```

## Menjalankan Aplikasi

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Aplikasi akan berjalan di**: http://localhost:9581

## API Endpoints

### SSO Authentication
- `GET /api/v1/auth/sso/login` - Redirect ke SSO server untuk login
- `GET /api/v1/auth/sso/callback` - Callback dari SSO server
- `POST /api/v1/auth/sso/logout` - Logout dari SSO

### User Management
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Health Check
- `GET /` - Application health check

## Integrasi dengan SSO Server

Untuk mengintegrasikan dengan SSO server, pastikan:

1. **SSO Server berjalan di port 9588**
2. **Client terdaftar di SSO server** dengan:
   - Client ID: `report-management-client`
   - Redirect URI: `http://localhost:9581/api/v1/auth/sso/callback`
   - Scopes: `read,write,profile,email`

3. **Konfigurasi CORS** di SSO server untuk mengizinkan origin:
   - `http://localhost:9581`
   - `http://localhost:3000` (frontend)

## Testing

1. **Test health check**:
```bash
curl http://localhost:9581/
```

2. **Test SSO login flow**:
```bash
# Redirect ke SSO server
curl http://localhost:9581/api/v1/auth/sso/login
```

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL berjalan
- Periksa kredensial database di file `.env`
- Pastikan database `report_management` sudah dibuat

### SSO Server Connection Error
- Pastikan SSO server berjalan di port 9588
- Periksa URL SSO server di file `.env`
- Pastikan client terdaftar di SSO server

### Port Already in Use
- Pastikan port 9581 tidak digunakan aplikasi lain
- Ubah port di file `.env` jika diperlukan

## Security Notes

- **Ganti semua secret key** di production
- **Gunakan HTTPS** di production
- **Set CORS origins** sesuai kebutuhan
- **Enable rate limiting** untuk proteksi API
