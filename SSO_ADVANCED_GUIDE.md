# Implementasi SSO Handler Advanced

## Deskripsi
Implementasi SSO Handler yang lengkap dan production-ready dengan fitur-fitur advanced untuk keamanan, monitoring, dan manajemen session yang robust.

## Fitur Advanced yang Diimplementasikan

### 🔐 **Keamanan Tingkat Enterprise**
- ✅ **Rate Limiting**: 10 percobaan per 15 menit per IP
- ✅ **Account Lockout**: Akun terkunci setelah 5 percobaan gagal
- ✅ **Password Hashing**: Menggunakan bcrypt untuk keamanan password
- ✅ **Client Validation**: Validasi client credentials dan redirect URI
- ✅ **Scope Validation**: Kontrol akses berdasarkan scope
- ✅ **IP Tracking**: Pelacakan aktivitas berdasarkan IP address

### 🔄 **Token Management yang Robust**
- ✅ **Access Token**: JWT dengan expiry 1 jam
- ✅ **Refresh Token**: JWT dengan expiry 7 hari
- ✅ **Authorization Code**: Expiry 10 menit dengan single-use
- ✅ **Token Rotation**: Refresh token diperbarui setiap kali digunakan
- ✅ **Session Management**: Tracking session per user dan client
- ✅ **Auto Cleanup**: Pembersihan otomatis token expired setiap 5 menit

### 👥 **User Management**
- ✅ **Role-Based Access Control (RBAC)**: Sistem role dan permission
- ✅ **User Database**: Mock database dengan user admin dan user biasa
- ✅ **Account Status**: Tracking status aktif, login terakhir, dll
- ✅ **Failed Attempts**: Tracking percobaan login gagal
- ✅ **Account Lockout**: Temporary lockout untuk keamanan

### 🏢 **Client Management**
- ✅ **Client Registration**: Database client dengan credentials
- ✅ **Redirect URI Validation**: Validasi URI callback yang diizinkan
- ✅ **Scope Management**: Kontrol scope yang diizinkan per client
- ✅ **Client Status**: Tracking status aktif dan penggunaan terakhir

### 📊 **Monitoring & Logging**
- ✅ **Comprehensive Logging**: Log semua aktivitas dengan detail
- ✅ **System Statistics**: Endpoint untuk monitoring sistem
- ✅ **Audit Trail**: Tracking semua aktivitas user dan client
- ✅ **Performance Metrics**: Monitoring memory usage dan uptime
- ✅ **Error Tracking**: Logging error dengan stack trace

### 🛡️ **Security Features**
- ✅ **JWT Security**: Token dengan signature verification
- ✅ **CSRF Protection**: State parameter untuk mencegah CSRF
- ✅ **Session Hijacking Prevention**: Session ID tracking
- ✅ **Brute Force Protection**: Rate limiting dan account lockout
- ✅ **Token Invalidation**: Logout dengan invalidasi semua token

## Endpoints yang Tersedia

### 1. **Login SSO** - `POST /api/v1/auth/sso/login`
**Fitur Advanced:**
- Rate limiting per IP
- Account lockout protection
- Client validation
- Scope management
- Comprehensive logging

**Request Body:**
```json
{
  "username": "admin",
  "password": "password",
  "client_id": "test_client",
  "redirect_uri": "http://localhost:3001/callback",
  "scope": "read write",
  "state": "random_state"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login SSO berhasil",
  "data": {
    "user_id": "uuid",
    "user_name": "admin",
    "user_email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "roles": ["admin", "user"],
    "permissions": ["read", "write", "delete", "admin"],
    "client_id": "test_client",
    "session_id": "uuid",
    "login_time": "2025-09-08T09:30:00.000Z",
    "ip_address": "127.0.0.1",
    "authorization_code": "generated_code",
    "redirect_uri": "http://localhost:3001/callback",
    "expires_in": 600
  }
}
```

### 2. **Authorization** - `GET /api/v1/auth/sso/authorize`
**Fitur Advanced:**
- Client validation
- Redirect URI validation
- Scope validation
- Rate limiting
- Comprehensive logging

**Query Parameters:**
- `client_id`: ID client aplikasi
- `redirect_uri`: URI callback yang terdaftar
- `response_type`: Harus "code"
- `state`: Parameter state untuk CSRF protection
- `scope`: Scope yang diminta (read, write, admin)

### 3. **Token Exchange** - `POST /api/v1/auth/sso/token`
**Fitur Advanced:**
- Support authorization_code dan refresh_token grant types
- Client secret validation
- Token rotation untuk refresh token
- Session tracking
- Comprehensive security logging

**Authorization Code Flow:**
```json
{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "client_id": "test_client",
  "client_secret": "test_secret",
  "redirect_uri": "http://localhost:3001/callback"
}
```

**Refresh Token Flow:**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "refresh_token",
  "client_id": "test_client",
  "client_secret": "test_secret"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token berhasil dibuat",
  "data": {
    "access_token": "jwt_token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "refresh_token",
    "scope": "read write",
    "session_id": "uuid"
  }
}
```

### 4. **User Info** - `GET /api/v1/auth/sso/userinfo`
**Fitur Advanced:**
- Detailed user information
- Role dan permission data
- Session tracking
- Activity logging

**Headers:**
```
Authorization: Bearer your_access_token
```

**Response:**
```json
{
  "success": true,
  "message": "User info berhasil diambil",
  "data": {
    "user_id": "uuid",
    "user_name": "admin",
    "user_email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "roles": ["admin", "user"],
    "permissions": ["read", "write", "delete", "admin"],
    "client_id": "test_client",
    "session_id": "uuid",
    "scope": ["read", "write"],
    "login_time": "2025-09-08T09:30:00.000Z",
    "last_activity": "2025-09-08T09:35:00.000Z"
  }
}
```

### 5. **Callback** - `GET /api/v1/auth/sso/callback`
**Fitur Advanced:**
- Authorization code validation
- Error handling dengan error_description
- Comprehensive logging
- State validation

### 6. **Logout** - `POST /api/v1/auth/sso/logout`
**Fitur Advanced:**
- Multiple token invalidation
- Client-wide logout
- Session cleanup
- Comprehensive logging

**Request Body:**
```json
{
  "token": "access_token",
  "refresh_token": "refresh_token",
  "client_id": "test_client"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": {
    "message": "Logout berhasil",
    "tokens_invalidated": 3
  }
}
```

### 7. **System Statistics** - `GET /api/v1/auth/sso/stats`
**Fitur Advanced:**
- Real-time system monitoring
- Memory usage tracking
- Active sessions count
- Performance metrics

**Response:**
```json
{
  "success": true,
  "message": "Statistik sistem berhasil diambil",
  "data": {
    "active_tokens": 15,
    "active_refresh_tokens": 8,
    "pending_authorization_codes": 3,
    "registered_clients": 2,
    "registered_users": 2,
    "rate_limited_ips": 0,
    "failed_attempts_tracked": 0,
    "uptime": 3600,
    "memory_usage": {
      "rss": 45678912,
      "heapTotal": 20971520,
      "heapUsed": 15728640,
      "external": 1234567
    },
    "timestamp": "2025-09-08T09:35:00.000Z"
  }
}
```

## Kredensial Default

### Users:
- **Admin User:**
  - Username: `admin`
  - Password: `password`
  - Roles: `admin`, `user`
  - Permissions: `read`, `write`, `delete`, `admin`

- **Regular User:**
  - Username: `user`
  - Password: `password`
  - Roles: `user`
  - Permissions: `read`

### Clients:
- **Test Client:**
  - Client ID: `test_client`
  - Client Secret: `test_secret`
  - Redirect URIs: `http://localhost:3001/callback`, `http://localhost:3002/callback`
  - Scopes: `read`, `write`

## Security Features

### Rate Limiting
- **Login**: 10 percobaan per 15 menit per IP
- **Authorization**: 10 percobaan per 15 menit per IP
- **Token Exchange**: 10 percobaan per 15 menit per IP

### Account Protection
- **Failed Attempts**: Tracking percobaan login gagal
- **Account Lockout**: Akun terkunci 30 menit setelah 5 percobaan gagal
- **Password Security**: Menggunakan bcrypt hashing

### Token Security
- **JWT Signature**: Token ditandatangani dengan secret key
- **Token Rotation**: Refresh token diperbarui setiap penggunaan
- **Session Tracking**: Setiap token terkait dengan session ID
- **Auto Expiry**: Token expired otomatis dibersihkan

## Monitoring & Logging

### Log Levels
- **INFO**: Aktivitas normal (login, logout, token exchange)
- **WARN**: Aktivitas mencurigakan (rate limit, invalid credentials)
- **ERROR**: Error sistem dengan stack trace

### Metrics Tracked
- Active tokens dan refresh tokens
- Pending authorization codes
- Registered clients dan users
- Rate limited IPs
- Failed attempts
- System uptime dan memory usage

## Production Considerations

### Database Integration
Saat ini menggunakan in-memory storage. Untuk production, integrasikan dengan:
- **Redis**: Untuk token storage dan session management
- **PostgreSQL**: Untuk user dan client database
- **MongoDB**: Untuk audit logs

### Scalability
- **Load Balancing**: Support multiple server instances
- **Session Sharing**: Redis untuk session sharing antar server
- **Database Clustering**: Untuk high availability

### Security Enhancements
- **HTTPS Only**: Enforce SSL/TLS
- **CORS Configuration**: Proper CORS setup
- **Security Headers**: Implement security headers
- **Audit Logging**: Comprehensive audit trail

## Testing

### Manual Testing
```bash
# Test login
curl -X POST http://localhost:9588/api/v1/auth/sso/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password","client_id":"test_client","redirect_uri":"http://localhost:3001/callback","scope":"read write"}'

# Test stats
curl -X GET http://localhost:9588/api/v1/auth/sso/stats
```

### Automated Testing
Gunakan test script yang sudah disediakan untuk comprehensive testing.

## Troubleshooting

### Common Issues
1. **Rate Limited**: Tunggu 15 menit atau restart server
2. **Account Locked**: Tunggu 30 menit atau reset failed attempts
3. **Invalid Client**: Pastikan client terdaftar dan aktif
4. **Token Expired**: Gunakan refresh token untuk mendapatkan token baru

### Debug Information
- Check system stats endpoint untuk monitoring
- Review logs untuk error details
- Verify client configuration
- Check token expiry times

Implementasi ini memberikan foundation yang solid untuk SSO system yang production-ready dengan keamanan tingkat enterprise dan monitoring yang comprehensive.
