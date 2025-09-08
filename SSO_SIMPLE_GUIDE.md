# Panduan SSO Handler Sederhana

## Deskripsi
Implementasi SSO Handler yang telah disederhanakan untuk memudahkan penggunaan dan pengembangan.

## Fitur Utama
- ✅ Login sederhana dengan validasi kredensial
- ✅ Authorization code flow (OAuth2)
- ✅ JWT token generation dan validation
- ✅ User info endpoint
- ✅ Logout dengan token invalidation
- ✅ Auto cleanup expired tokens dan codes
- ✅ Pesan error dalam Bahasa Indonesia

## Konfigurasi

### Environment Variables
```bash
# SSO Configuration
SSO_MODE=server
SSO_SERVER_URL=http://localhost:3000
SSO_SERVER_SECRET=your_sso_server_secret_key
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
```

## Endpoints

### 1. Login SSO
**POST** `/auth/sso/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123",
  "client_id": "your_client_id",
  "redirect_uri": "http://localhost:3001/callback"
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
    "role_id": "uuid",
    "client_id": "your_client_id",
    "authorization_code": "generated_code",
    "redirect_uri": "http://localhost:3001/callback"
  }
}
```

### 2. Authorization
**GET** `/auth/sso/authorize`

**Query Parameters:**
- `client_id`: ID client aplikasi
- `redirect_uri`: URI callback
- `response_type`: Harus "code"
- `state`: Parameter state (opsional)

**Response:**
```json
{
  "success": true,
  "message": "Authorization berhasil",
  "data": {
    "authorization_url": "http://localhost:3001/callback?code=xxx&state=xxx",
    "code": "generated_code",
    "state": "state_value"
  }
}
```

### 3. Token Exchange
**POST** `/auth/sso/token`

**Request Body:**
```json
{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "redirect_uri": "http://localhost:3001/callback"
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
    "expires_in": 86400,
    "refresh_token": "refresh_token",
    "scope": "read write"
  }
}
```

### 4. User Info
**GET** `/auth/sso/userinfo`

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
    "role_id": "uuid",
    "client_id": "your_client_id"
  }
}
```

### 5. Callback
**GET** `/auth/sso/callback`

**Query Parameters:**
- `code`: Authorization code
- `state`: State parameter (opsional)
- `error`: Error message (jika ada)

**Response:**
```json
{
  "success": true,
  "message": "Callback berhasil diproses",
  "data": {
    "message": "SSO callback berhasil",
    "code": "authorization_code",
    "state": "state_value",
    "redirect_uri": "http://localhost:3001/callback"
  }
}
```

### 6. Logout
**POST** `/auth/sso/logout`

**Request Body:**
```json
{
  "token": "access_token_to_invalidate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null
}
```

## Kredensial Default untuk Testing
- **Username:** `admin`
- **Password:** `admin123`

## Keamanan
- Authorization codes expire dalam 10 menit
- JWT tokens expire dalam 24 jam
- Auto cleanup expired tokens dan codes
- Validasi client credentials
- Bearer token authentication untuk protected endpoints

## Penggunaan dalam Aplikasi Client

### 1. Redirect ke Authorization
```javascript
const authUrl = `http://localhost:3000/auth/sso/authorize?client_id=your_client_id&redirect_uri=http://localhost:3001/callback&response_type=code&state=random_state`;
window.location.href = authUrl;
```

### 2. Handle Callback
```javascript
// Di callback page
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

if (code) {
  // Exchange code untuk token
  fetch('http://localhost:3000/auth/sso/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: 'your_client_id',
      client_secret: 'your_client_secret',
      redirect_uri: 'http://localhost:3001/callback'
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Simpan access token
      localStorage.setItem('access_token', data.data.access_token);
      // Redirect ke dashboard
      window.location.href = '/dashboard';
    }
  });
}
```

### 3. Menggunakan Token untuk API Calls
```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:3000/auth/sso/userinfo', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('User info:', data.data);
  }
});
```

## Troubleshooting

### Error: "Kredensial tidak valid"
- Pastikan username dan password sesuai dengan kredensial default
- Username: `admin`, Password: `admin123`

### Error: "Authorization code tidak valid"
- Authorization code mungkin sudah expired (10 menit)
- Authorization code mungkin sudah digunakan
- Pastikan client_id sesuai

### Error: "Token tidak valid"
- Token mungkin sudah expired (24 jam)
- Pastikan format Bearer token benar: `Bearer your_token`

### Error: "Client ID tidak sesuai"
- Pastikan client_id yang digunakan konsisten di semua request
- Periksa konfigurasi SSO client

## Pengembangan Lebih Lanjut
- Integrasi dengan database untuk user management
- Implementasi refresh token flow
- Role-based access control
- Multi-tenant support
- Audit logging
- Rate limiting per endpoint
