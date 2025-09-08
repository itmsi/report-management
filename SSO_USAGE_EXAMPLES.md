# Contoh Penggunaan SSO Boilerplate

## 1. Setup Awal

### Server Mode (.env)
```env
SSO_MODE=server
SSO_SERVER_URL=http://localhost:3000
SSO_SERVER_SECRET=your_super_secret_key_here
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

### Client Mode (.env)
```env
SSO_MODE=client
SSO_CLIENT_ID=my_client_app
SSO_CLIENT_SECRET=my_client_secret
SSO_REDIRECT_URI=http://localhost:3001/auth/sso/callback
SSO_AUTHORIZATION_URL=http://localhost:3000/auth/sso/authorize
SSO_TOKEN_URL=http://localhost:3000/auth/sso/token
SSO_USER_INFO_URL=http://localhost:3000/auth/sso/userinfo
```

## 2. Menjalankan Aplikasi

### Server Mode
```bash
# Terminal 1 - SSO Server
SSO_MODE=server npm start
# Server berjalan di http://localhost:3000
```

### Client Mode
```bash
# Terminal 2 - SSO Client
SSO_MODE=client npm start
# Client berjalan di http://localhost:3001
```

## 3. Testing SSO Flow

### Server Mode - Direct Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/sso/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "admin",
    "user_password": "password"
  }'
```

### Client Mode - OAuth2 Flow

1. **Redirect ke SSO Server**
```bash
curl http://localhost:3001/api/v1/auth/sso/login
# Akan redirect ke: http://localhost:3000/auth/sso/authorize?client_id=my_client_app&redirect_uri=http://localhost:3001/auth/sso/callback&response_type=code&state=random_state
```

2. **Login di SSO Server**
```bash
curl -X POST http://localhost:3000/api/v1/auth/sso/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "admin",
    "user_password": "password",
    "client_id": "my_client_app",
    "redirect_uri": "http://localhost:3001/auth/sso/callback"
  }'
```

3. **Exchange Authorization Code**
```bash
curl -X POST http://localhost:3000/api/v1/auth/sso/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "authorization_code_from_step_2",
    "client_id": "my_client_app",
    "client_secret": "my_client_secret",
    "redirect_uri": "http://localhost:3001/auth/sso/callback"
  }'
```

4. **Get User Info**
```bash
curl -X GET http://localhost:3000/api/v1/auth/sso/userinfo \
  -H "Authorization: Bearer access_token_from_step_3"
```

## 4. User Management API

### Create Permission
```bash
curl -X POST http://localhost:3000/api/v1/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "permission_name": "create_user"
  }'
```

### Create Menu
```bash
curl -X POST http://localhost:3000/api/v1/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "menu_name": "User Management",
    "menu_url": "/users",
    "menu_icon": "fas fa-users",
    "menu_order": 1
  }'
```

### Create Role
```bash
curl -X POST http://localhost:3000/api/v1/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "role_name": "User Manager"
  }'
```

### Assign Permissions to Role
```bash
curl -X POST http://localhost:3000/api/v1/roles/role_id/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "permissions": [
      {
        "menu_id": "menu_id",
        "permission_id": "permission_id"
      }
    ]
  }'
```

### Create User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "employee_id": "employee_id",
    "role_id": "role_id",
    "user_name": "newuser",
    "user_email": "newuser@company.com",
    "user_password": "password123"
  }'
```

## 5. Frontend Integration

### Server Mode - Login Form
```html
<form action="/api/v1/auth/sso/login" method="POST">
  <input type="text" name="user_name" placeholder="Username" required>
  <input type="password" name="user_password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>
```

### Client Mode - Redirect to SSO
```javascript
// Redirect to SSO server
window.location.href = '/api/v1/auth/sso/login';

// Handle callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

if (code) {
  // Exchange code for token
  fetch('/api/v1/auth/sso/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state })
  })
  .then(response => response.json())
  .then(data => {
    // Store token and user info
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  });
}
```

## 6. Middleware Usage

### Protect Routes
```javascript
const { requireAuth } = require('./modules/sso');

// Protect all routes
app.use('/api/v1/protected', requireAuth);

// Protect specific route
app.get('/api/v1/dashboard', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

### Check SSO Mode
```javascript
const { isServerMode, isClientMode } = require('./modules/sso');

if (isServerMode()) {
  console.log('Running in SSO Server mode');
} else if (isClientMode()) {
  console.log('Running in SSO Client mode');
}
```

## 7. Production Considerations

### Security
- Gunakan HTTPS di production
- Set JWT secret yang kuat dan unik
- Implement rate limiting
- Validate semua input
- Gunakan database untuk menyimpan authorization codes

### Performance
- Gunakan Redis untuk session storage
- Implement token blacklist untuk logout
- Cache user permissions
- Optimize database queries

### Monitoring
- Log semua SSO activities
- Monitor failed login attempts
- Track token usage
- Set up alerts untuk suspicious activities
