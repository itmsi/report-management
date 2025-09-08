# Categories Module

Module untuk mengelola data kategori dalam sistem Report Management.

## Fitur

- ✅ **CRUD Operations**: Create, Read, Update, Delete kategori
- ✅ **Soft Delete**: Penghapusan data dengan soft delete
- ✅ **Pagination & Filtering**: Pagination dengan filter berdasarkan nama dan deskripsi
- ✅ **Search**: Pencarian berdasarkan nama kategori atau deskripsi
- ✅ **Sorting**: Sorting berdasarkan nama, created_at, atau updated_at
- ✅ **JWT Authentication**: Proteksi endpoint dengan JWT
- ✅ **Validation**: Validasi input yang komprehensif
- ✅ **UUID Support**: Semua ID menggunakan UUID

## Database Schema

### Tabel: categories

| Column | Type | Description |
|--------|------|-------------|
| category_id | uuid | Primary key (auto-generated) |
| name | string(100) | Nama kategori (required) |
| description | text | Deskripsi kategori (nullable) |
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

- `POST /api/v1/categories` - Buat kategori baru
- `GET /api/v1/categories` - Daftar kategori dengan pagination
- `GET /api/v1/categories/:id` - Detail kategori
- `PUT /api/v1/categories/:id` - Update kategori
- `DELETE /api/v1/categories/:id` - Hapus kategori (soft delete)
- `POST /api/v1/categories/:id/restore` - Restore kategori yang dihapus
- `GET /api/v1/categories/:id/powerbi` - Kategori dengan data PowerBI

## Query Parameters

### GET /api/v1/categories
- `page` (number): Halaman (default: 1)
- `limit` (number): Jumlah data per halaman (default: 10)
- `search` (string): Pencarian berdasarkan nama atau deskripsi
- `sort_by` (string): Field untuk sorting (name, created_at, updated_at)
- `sort_order` (string): Urutan sorting (asc, desc)

## Request/Response Examples

### Create Category
```http
POST /api/v1/categories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Sales Report",
  "description": "Reports related to sales performance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Sales Report",
    "description": "Reports related to sales performance",
    "created_at": "2025-01-09T10:00:00.000Z",
    "updated_at": null,
    "deleted_at": null,
    "is_delete": false,
    "created_by": "user-uuid",
    "updated_by": null,
    "deleted_by": null
  }
}
```

### List Categories
```http
GET /api/v1/categories?page=1&limit=10&search=sales&sort_by=name&sort_order=asc
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "category_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sales Report",
      "description": "Reports related to sales performance",
      "created_at": "2025-01-09T10:00:00.000Z",
      "updated_at": null,
      "deleted_at": null,
      "is_delete": false,
      "created_by": "user-uuid",
      "updated_by": null,
      "deleted_by": null
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

## Validation Rules

### Create Category
- `name`: Required, string, max 100 characters
- `description`: Optional, string, max 1000 characters

### Update Category
- `name`: Optional, string, max 100 characters
- `description`: Optional, string, max 1000 characters

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Category not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create category",
  "error": "Error message details"
}
```
