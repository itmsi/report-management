# SSO API Server - User Management System

Sistem API Server SSO yang lengkap untuk manajemen user, perusahaan, departemen, dan jabatan.

## 🏗️ **Arsitektur Sistem**

### **Database Schema**
```
companies (Perusahaan)
├── departments (Departemen)
    ├── titles (Jabatan)
        ├── employees (Karyawan)
            └── users (User Account)
```

### **Module Structure**
```
src/modules/
├── auth/           # Authentication & Authorization
├── companies/      # Perusahaan Management
├── departments/    # Departemen Management  
├── titles/         # Jabatan Management
├── employees/      # Karyawan Management
├── users/          # User Account Management
├── roles/          # Role Management
├── permissions/    # Permission Management
├── menus/          # Menu Management
├── systems/        # System Management
└── sso/           # SSO Integration
```

## 🚀 **API Endpoints**

### **Authentication**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token

### **Companies Management**
- `GET /api/v1/companies` - List companies
- `GET /api/v1/companies/:id` - Get company by ID
- `POST /api/v1/companies` - Create company
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company
- `GET /api/v1/companies/hierarchy` - Get company hierarchy
- `GET /api/v1/companies/stats` - Get companies statistics

### **Departments Management**
- `GET /api/v1/departments` - List departments
- `GET /api/v1/departments/:id` - Get department by ID
- `POST /api/v1/departments` - Create department
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department
- `GET /api/v1/departments/company/:companyId` - Get departments by company

### **Titles Management**
- `GET /api/v1/titles` - List titles
- `GET /api/v1/titles/:id` - Get title by ID
- `POST /api/v1/titles` - Create title
- `PUT /api/v1/titles/:id` - Update title
- `DELETE /api/v1/titles/:id` - Delete title
- `GET /api/v1/titles/department/:departmentId` - Get titles by department

### **Employees Management**
- `GET /api/v1/employees` - List employees
- `GET /api/v1/employees/:id` - Get employee by ID
- `POST /api/v1/employees` - Create employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee
- `GET /api/v1/employees/title/:titleId` - Get employees by title

### **Users Management**
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### **SSO Integration**
- `POST /api/v1/sso/login` - SSO login
- `POST /api/v1/sso/logout` - SSO logout
- `GET /api/v1/sso/user` - Get SSO user info
- `POST /api/v1/sso/validate` - Validate SSO token

## 🔐 **Security Features**

### **Authentication**
- JWT Token based authentication
- Token refresh mechanism
- Password hashing with bcrypt
- Rate limiting protection

### **Authorization**
- Role-based access control (RBAC)
- Permission-based authorization
- Menu-based access control
- System-level permissions

### **Data Protection**
- Soft delete implementation
- Audit trail (created_by, updated_by, deleted_by)
- Input validation and sanitization
- SQL injection protection

## 📊 **Features**

### **User Management**
- ✅ Hierarchical company structure
- ✅ Department management
- ✅ Title/Position management
- ✅ Employee management
- ✅ User account management
- ✅ Role and permission management

### **SSO Integration**
- ✅ Single Sign-On support
- ✅ Token validation
- ✅ User session management
- ✅ Cross-system authentication

### **API Features**
- ✅ RESTful API design
- ✅ Pagination support
- ✅ Search and filtering
- ✅ Standardized response format
- ✅ Error handling
- ✅ Input validation

## 🛠️ **Setup & Installation**

### **Prerequisites**
- Node.js 16+
- PostgreSQL 12+
- Redis (optional, for session storage)

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd gate

# Install dependencies
npm install

# Setup environment
cp environment.example .env

# Run migrations
npm run migrate

# Run seeders
npm run seed

# Start development server
npm run dev
```

### **Environment Configuration**
```env
# Database
DB_CLIENT_DEV=postgresql
DB_HOST_DEV=localhost
DB_PORT_DEV=5432
DB_USER_DEV=your_username
DB_PASS_DEV=your_password
DB_NAME_DEV=sso_gate_dev

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# SSO Configuration
SSO_CLIENT_ID=your_sso_client_id
SSO_CLIENT_SECRET=your_sso_client_secret
SSO_REDIRECT_URI=http://localhost:3000/api/v1/sso/callback
```

## 📝 **API Documentation**

### **Response Format**
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### **Error Format**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### **Pagination Format**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 🔧 **Development**

### **Running Tests**
```bash
npm test
```

### **Code Quality**
```bash
npm run lint
npm run lint:fix
```

### **Database Management**
```bash
# Create migration
npm run migrate:make create_table_name

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback

# Create seeder
npm run seed:make table_name_seed

# Run seeders
npm run seed
```

## 📈 **Performance Optimization**

### **Database Optimization**
- Indexed columns for better query performance
- Soft delete for data integrity
- Pagination for large datasets
- Connection pooling

### **API Optimization**
- Response caching
- Request validation
- Error handling
- Rate limiting

## 🚀 **Deployment**

### **Production Setup**
```bash
# Build application
npm run build

# Start production server
npm start
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t sso-gate .

# Run container
docker run -p 3000:3000 sso-gate
```

## 📞 **Support**

Untuk pertanyaan atau bantuan, silakan hubungi tim development.

---

**SSO API Server v1.0** - Complete User Management System
