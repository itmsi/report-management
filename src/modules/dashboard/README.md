# Dashboard Module

Module dashboard untuk menampilkan data gabungan dari tabel `categories` dan `powerBis` dengan fitur filtering dan pagination.

## Fitur

- **POST /api/dashboard** - Mendapatkan data dashboard dengan filter
- **GET/POST /api/dashboard/stats** - Mendapatkan statistik dashboard
- **GET/POST /api/dashboard/activities** - Mendapatkan aktivitas terbaru

## Endpoint Utama

### POST /api/dashboard

Endpoint utama untuk mendapatkan data dashboard dengan menggabungkan data dari tabel `categories` dan `powerBis`.

**Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "kata kunci pencarian",
  "sort_by": "created_at",
  "sort_order": "desc",
  "category_id": "uuid-category",
  "category_name": "nama kategori",
  "title": "judul laporan",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": [
    {
      "category_name": "Nama Kategori",
      "title": "Judul PowerBI Report",
      "status": "active",
      "link": "https://powerbi.com/report/123",
      "file": "https://minio.com/file.pdf",
      "description": "Deskripsi laporan"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Parameter Filter

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `page` | integer | Nomor halaman (default: 1) |
| `limit` | integer | Jumlah item per halaman (max: 100, default: 10) |
| `search` | string | Pencarian di category_name, title, dan description |
| `sort_by` | string | Field untuk sorting: category_name, title, status, created_at, updated_at |
| `sort_order` | string | Urutan sorting: asc, desc |
| `category_id` | uuid | Filter berdasarkan ID kategori |
| `category_name` | string | Filter berdasarkan nama kategori |
| `title` | string | Filter berdasarkan judul laporan PowerBI |
| `status` | string | Filter berdasarkan status: active, inactive, draft |

## Response Fields

| Field | Sumber | Deskripsi |
|-------|---------|-----------|
| `category_name` | `categories.name` | Nama kategori |
| `title` | `powerBis.title` | Judul laporan PowerBI |
| `status` | `powerBis.status` | Status laporan |
| `link` | `powerBis.link` | Link ke laporan PowerBI |
| `file` | `powerBis.file` | File attachment |
| `description` | `powerBis.description` | Deskripsi laporan |

## Endpoint Tambahan

### GET/POST /api/dashboard/stats

Mendapatkan statistik dashboard:
- Total kategori
- Total laporan PowerBI
- Laporan berdasarkan status
- Laporan berdasarkan kategori

### GET/POST /api/dashboard/activities

Mendapatkan aktivitas terbaru dengan parameter:
- `limit` (1-50, default: 10)

## Autentikasi

Semua endpoint memerlukan Bearer token di header:
```
Authorization: Bearer <your-jwt-token>
```

## Swagger Documentation

Dokumentasi lengkap tersedia di Swagger UI dengan schema dan contoh request/response yang detail.
