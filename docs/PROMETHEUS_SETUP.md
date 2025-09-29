# Setup Prometheus Monitoring untuk Report Management

Dokumentasi ini menjelaskan cara mengatur monitoring Prometheus untuk aplikasi Report Management.

## Overview

Aplikasi Report Management telah terintegrasi dengan Prometheus untuk monitoring dengan menggunakan package `prom-client`. Monitoring ini mencakup:

- HTTP request metrics (total requests, duration, response size)
- Business metrics (report generation, file uploads, user logins, SSO requests)
- Queue metrics (RabbitMQ message processing)
- System metrics (active connections, database connections)

## Konfigurasi Environment

Tambahkan konfigurasi berikut ke file `.env`:

```bash
# Prometheus Configuration
PROMETHEUS_ENABLED=true
PROMETHEUS_SERVER_URL=https://prometheus.motorsights.com
PROMETHEUS_SCRAPE_INTERVAL=15s
PROMETHEUS_METRICS_PATH=/metrics
PROMETHEUS_JOB_NAME=report-management
```

## Endpoint Metrics

Aplikasi menyediakan endpoint `/metrics` untuk Prometheus scraping:

```
GET http://localhost:9581/metrics
```

Endpoint ini mengembalikan metrics dalam format Prometheus yang dapat di-scrape oleh server Prometheus.

## Metrics yang Tersedia

### HTTP Metrics
- `report_management_http_requests_total` - Total HTTP requests
- `report_management_http_request_duration_seconds` - Duration HTTP requests
- `report_management_http_request_size_bytes` - Size HTTP requests

### Business Metrics
- `report_management_reports_generated_total` - Total reports generated
- `report_management_file_uploads_total` - Total file uploads
- `report_management_user_logins_total` - Total user logins
- `report_management_sso_requests_total` - Total SSO requests

### Queue Metrics
- `report_management_queue_messages_processed_total` - Total messages processed
- `report_management_queue_size` - Current queue size

### System Metrics
- `report_management_active_connections` - Active connections
- `report_management_database_connections` - Database connections

### Default Node.js Metrics
- `report_management_process_*` - Process metrics (CPU, memory, etc.)
- `report_management_nodejs_*` - Node.js specific metrics

## Konfigurasi Prometheus Server

Untuk mengonfigurasi Prometheus server agar dapat scrape aplikasi ini, tambahkan konfigurasi berikut ke `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'report-management'
    static_configs:
      - targets: ['localhost:9581']  # atau URL aplikasi Anda
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s
```

## Konfigurasi Grafana Dashboard

### Data Source
1. Buka Grafana di https://grafana.motorsights.com/
2. Tambahkan Data Source Prometheus
3. URL: https://prometheus.motorsights.com/
4. Test & Save

### Dashboard Panels

#### HTTP Metrics Panel
```promql
# Request Rate
rate(report_management_http_requests_total[5m])

# Response Time Percentiles
histogram_quantile(0.95, rate(report_management_http_request_duration_seconds_bucket[5m]))
histogram_quantile(0:50, rate(report_management_http_request_duration_seconds_bucket[5m]))

# Error Rate
rate(report_management_http_requests_total{status=~"5.."}[5m]) / rate(report_management_http_requests_total[5m])
```

#### Business Metrics Panel
```promql
# Report Generation Rate
rate(report_management_reports_generated_total[5m])

# File Upload Rate
rate(report_management_file_uploads_total[5m])

# Login Rate
rate(report_management_user_logins_total[5m])
```

## Menggunakan Business Metrics di Kode

### Contoh Tracking Login
```javascript
const { trackUserLogin } = require('../middlewares/prometheus')

// Di dalam auth handler
const signin = async (req, res) => {
  const result = await authenticateUser(req.body)
  
  // Track metrics
  if (result.success) {
    trackUserLogin('admin', 'success')
  } else {
    trackUserLogin('admin', 'failed')
  }
  
  return res.json(result)
}
```

### Contoh Tracking Report Generation
```javascript
const { trackReportGenerated } = require('../middlewares/prometheus')

const generateReport = async (req, res) => {
  try {
    const report = await createReport(req.body)
    trackReportGenerated('monthly', 'success')
    return res.json({ success: true, data: report })
  } catch (error) {
    trackReportGenerated('monthly', 'failed')
    throw error
  }
}
```

### Contoh Tracking File Upload
```javascript
const { trackFileUpload } = require('../middlewares/prometheus')

const uploadFile = async (req, res) => {
  const fileType = req.file.mimetype.split('/')[1]
  
  try {
    await processFile(req.file)
    trackFileUpload(fileType, 'success')
    return res.json({ success: true })
  } catch (error) {
    trackFileUpload(fileType, 'failed')
    throw error
  }
}
```

## Monitoring Alerts

### Contoh Alert Rules untuk Prometheus
```yaml
groups:
  - name: report_management
    rules:
      - alert: HighErrorRate
        expr: rate(report_management_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(report_management_http_request_duration_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          
      - alert: ApplicationDown
        expr: up{job="report-management"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
```

## Troubleshooting

### Metrics tidak muncul di Prometheus
1. Pastikan endpoint `/metrics` dapat diakses
2. Cek konfigurasi scrape job di Prometheus
3. Pastikan aplikasi berjalan di port yang benar

### Grafana tidak menampilkan data
1. Pastikan Prometheus dapat scrape metrics dengan benar
2. Cek Data Source configuration di Grafana
3. Verifikasi Query Language (PromQL) Anda

### Performance Impact
- Prometheus middleware memiliki overhead minimal
- Default Node.js metrics collection dapat memakan sedikit memori
- Gunakan monitoring dengan interval yang wajar (15-30 detik)

## Testing Koneksi

### Test Metrics Endpoint
```bash
curl http://localhost:9581/metrics
```

### Test Specific Metrics
```bash
# HTTP requests
curl http://localhost:9581/metrics | grep http_requests_total

# Business metrics
curl http://localhost:9581/metrics | grep reports_generated_total
```

## Best Practices

1. **Label Consistency**: Gunakan label yang konsisten untuk semua metrics
2. **Metrics Cardinality**: Hindari label dengan cardinality tinggi
3. **Monitoring Interval**: Gunakan interval yang wajar untuk menghindari overload
4. **Alert Thresholds**: Set up alert thresholds yang realistis
5. **Dashboard Design**: Buat dashboard yang mudah dibaca dan actionable

## Kontak dan Support

Jika mengalami masalah dengan monitoring setup, please contact:
- Documentation: docs/PROMETHEUS_SETUP.md
- Github Issues: https://github.com/falaqmsi/report-management/issues
