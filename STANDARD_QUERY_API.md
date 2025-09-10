# Standard Query API Documentation

Dokumentasi untuk penggunaan API dengan filter dan pagination yang terstandarisasi untuk endpoint `/categories` dan `/powerbi`.

## Query Parameters

### Pagination
- `page` (integer): Nomor halaman (default: 1, minimum: 1)
- `limit` (integer): Jumlah data per halaman (default: 10, minimum: 1, maksimum: 100)

### Sorting
- `sort_by` (string): Field untuk sorting
- `sort_order` (string): Urutan sorting (`asc` atau `desc`, default: `desc`)

### Search
- `search` (string): Kata kunci pencarian (case-insensitive)

### Filters
Filter yang tersedia berbeda untuk setiap endpoint.

## Endpoint Categories

### GET /api/v1/categories

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian berdasarkan nama atau deskripsi kategori
- `sort_by`: Field sorting (`name`, `created_at`, `updated_at`)
- `sort_order`: Urutan sorting (`asc`, `desc`)

**Response Format:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "category_id": "uuid",
      "name": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "created_by": "uuid",
      "updated_by": "uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Contoh Request:**
```
GET /api/v1/categories?page=1&limit=5&search=report&sort_by=name&sort_order=asc
```

## Endpoint PowerBI

### GET /api/v1/powerbi

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian berdasarkan title, description, atau nama kategori
- `sort_by`: Field sorting (`title`, `status`, `created_at`, `updated_at`)
- `sort_order`: Urutan sorting (`asc`, `desc`)
- `category_id`: Filter berdasarkan ID kategori (UUID)
- `status`: Filter berdasarkan status (`active`, `inactive`, `draft`)

**Response Format:**
```json
{
  "success": true,
  "message": "PowerBI reports retrieved successfully",
  "data": [
    {
      "powerbi_id": "uuid",
      "category_id": "uuid",
      "title": "string",
      "link": "string",
      "status": "active|inactive|draft",
      "file": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "created_by": "uuid",
      "updated_by": "uuid",
      "category_name": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Contoh Request:**
```
GET /api/v1/powerbi?page=1&limit=10&search=dashboard&category_id=uuid&status=active&sort_by=title&sort_order=asc
```

### GET /api/v1/powerbi/category/{category_id}

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian berdasarkan title atau description
- `sort_by`: Field sorting (`title`, `status`, `created_at`, `updated_at`)
- `sort_order`: Urutan sorting (`asc`, `desc`)
- `status`: Filter berdasarkan status (`active`, `inactive`, `draft`)

**Response Format:** Sama dengan endpoint PowerBI utama

**Contoh Request:**
```
GET /api/v1/powerbi/category/uuid?page=1&limit=5&status=active&sort_by=created_at&sort_order=desc
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Limit tidak boleh lebih dari 100",
  "data": null
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to list categories",
  "data": null
}
```

## Features

### 1. Pagination
- Default: 10 items per page
- Maximum: 100 items per page
- Metadata lengkap untuk navigasi

### 2. Search
- Case-insensitive search
- Multi-column search support
- Real-time filtering

### 3. Sorting
- Multiple column support
- Ascending/descending order
- Default sorting by created_at desc

### 4. Filtering
- Dynamic filter support
- Type validation
- Multiple filter combination

### 5. Response Standardization
- Consistent response format
- Comprehensive pagination metadata
- Error handling yang seragam

## Implementation Notes

### Untuk Developer

1. **Standard Query Utility**: Gunakan `parseStandardQuery()` untuk parsing parameter
2. **Repository Pattern**: Gunakan `findWithFilters()` untuk data dengan pagination
3. **Response Format**: Gunakan `sendQuerySuccess()` dan `sendQueryError()` untuk response yang konsisten
4. **Validation**: Implementasikan validasi parameter sesuai kebutuhan endpoint

### Configuration Options

```javascript
const queryParams = parseStandardQuery(req, {
  allowedColumns: ['name', 'created_at', 'updated_at'], // Kolom yang bisa di-sort
  defaultOrder: ['created_at', 'desc'], // Default sorting
  searchableColumns: ['name', 'description'], // Kolom yang bisa di-search
  allowedFilters: ['status', 'category_id'] // Filter yang diizinkan
});
```

## Migration dari Legacy

Endpoint yang sudah ada tetap kompatibel dengan format lama, namun disarankan untuk menggunakan format baru untuk konsistensi dan fitur yang lebih lengkap.
