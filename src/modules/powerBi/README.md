# PowerBI Module

Module untuk mengelola data PowerBI reports dalam sistem Report Management.

## Fitur

- ✅ **CRUD Operations**: Create, Read, Update, Delete PowerBI reports
- ✅ **Category Integration**: Integrasi dengan module categories
- ✅ **Status Management**: Manajemen status report (active, inactive, draft)
- ✅ **Soft Delete**: Penghapusan data dengan soft delete
- ✅ **Pagination & Filtering**: Pagination dengan filter berdasarkan kategori, status, dan pencarian
- ✅ **Search**: Pencarian berdasarkan title, description, atau category name
- ✅ **Sorting**: Sorting berdasarkan title, status, created_at, atau updated_at
- ✅ **Statistics**: Statistik overview PowerBI reports
- ✅ **JWT Authentication**: Proteksi endpoint dengan JWT
- ✅ **Validation**: Validasi input yang komprehensif
- ✅ **UUID Support**: Semua ID menggunakan UUID

## Database Schema

### Tabel: powerBis

| Column | Type | Description |
|--------|------|-------------|
| powerbi_id | uuid | Primary key (auto-generated) |
| category_id | uuid | Foreign key ke categories |
| title | string(200) | Judul PowerBI report (required) |
| link | text | Link PowerBI report (required) |
| status | string(50) | Status report (active, inactive, draft) |
| file | text | Path file PowerBI (nullable) |
| description | text | Deskripsi report (nullable) |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |
| deleted_at | timestamp | Waktu dihapus |
| is_delete | boolean | Flag soft delete |
| created_by | uuid | User yang membuat |
| updated_by | uuid | User yang mengupdate |
| deleted_by | uuid | User yang menghapus |

## API Endpoints

### Authentication Required
Semua endpoint memerlukan JWT token di header `Authorization: Bearer <token>`

- `POST /api/v1/powerbi` - Buat PowerBI report baru
- `GET /api/v1/powerbi` - Daftar PowerBI reports dengan pagination
- `GET /api/v1/powerbi/:id` - Detail PowerBI report
- `PUT /api/v1/powerbi/:id` - Update PowerBI report
- `DELETE /api/v1/powerbi/:id` - Hapus PowerBI report (soft delete)
- `POST /api/v1/powerbi/:id/restore` - Restore PowerBI report yang dihapus
- `GET /api/v1/powerbi/category/:category_id` - PowerBI reports berdasarkan kategori
- `GET /api/v1/powerbi/stats/overview` - Statistik overview PowerBI reports

## Query Parameters

### GET /api/v1/powerbi
- `page` (number): Halaman (default: 1)
- `limit` (number): Jumlah data per halaman (default: 10)
- `search` (string): Pencarian berdasarkan title, description, atau category name
- `category_id` (uuid): Filter berdasarkan kategori
- `status` (string): Filter berdasarkan status (active, inactive, draft)
- `sort_by` (string): Field untuk sorting (title, status, created_at, updated_at)
- `sort_order` (string): Urutan sorting (asc, desc)

## Request/Response Examples

### Create PowerBI Report
```http
POST /api/v1/powerbi
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- category_id: "550e8400-e29b-41d4-a716-446655440001"
- title: "Monthly Sales Dashboard"
- link: "https://app.powerbi.com/reportEmbed?reportId=sales-dashboard-001"
- status: "active"
- description: "Comprehensive monthly sales performance dashboard"
- file: [PowerBI file (.pbix, .xlsx, .pdf, etc.)]
```

**Response:**
```json
{
  "success": true,
  "message": "PowerBI report created successfully",
  "data": {
    "powerbi_id": "660e8400-e29b-41d4-a716-446655440001",
    "category_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Monthly Sales Dashboard",
    "link": "https://app.powerbi.com/reportEmbed?reportId=sales-dashboard-001",
    "status": "active",
    "file": "/uploads/powerbi/sales-dashboard-001.pbix",
    "description": "Comprehensive monthly sales performance dashboard",
    "created_at": "2025-01-09T10:00:00.000Z",
    "updated_at": null,
    "deleted_at": null,
    "is_delete": false,
    "created_by": "user-uuid",
    "updated_by": null,
    "deleted_by": null,
    "category_name": "Sales Report"
  }
}
```

### List PowerBI Reports
```http
GET /api/v1/powerbi?page=1&limit=10&status=active&category_id=550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "PowerBI reports retrieved successfully",
  "data": [
    {
      "powerbi_id": "660e8400-e29b-41d4-a716-446655440001",
      "category_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Monthly Sales Dashboard",
      "link": "https://app.powerbi.com/reportEmbed?reportId=sales-dashboard-001",
      "status": "active",
      "file": "/uploads/powerbi/sales-dashboard-001.pbix",
      "description": "Comprehensive monthly sales performance dashboard",
      "created_at": "2025-01-09T10:00:00.000Z",
      "updated_at": null,
      "deleted_at": null,
      "is_delete": false,
      "created_by": "user-uuid",
      "updated_by": null,
      "deleted_by": null,
      "category_name": "Sales Report"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Statistics
```http
GET /api/v1/powerbi/stats/overview
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "PowerBI statistics retrieved successfully",
  "data": {
    "total": 12,
    "active": 8,
    "inactive": 2,
    "draft": 2
  }
}
```

## Validation Rules

### Create PowerBI Report
- `category_id`: Required, valid UUID
- `title`: Required, string, max 200 characters
- `link`: Required, valid URL
- `status`: Optional, enum (active, inactive, draft), default: active
- `file`: Optional, string, max 1000 characters
- `description`: Optional, string, max 1000 characters

### Update PowerBI Report
- `category_id`: Optional, valid UUID
- `title`: Optional, string, max 200 characters
- `link`: Optional, valid URL
- `status`: Optional, enum (active, inactive, draft)
- `file`: Optional, string, max 1000 characters
- `description`: Optional, string, max 1000 characters

## Status Values

- **active**: Report aktif dan dapat diakses
- **inactive**: Report tidak aktif sementara
- **draft**: Report dalam tahap draft/pengembangan

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "link",
      "message": "Link must be a valid URL"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "PowerBI report not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create PowerBI report",
  "error": "Error message details"
}
```
