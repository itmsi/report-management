#!/bin/bash

# Test script untuk semua endpoint dengan fitur filter dan pagination yang sudah diupdate
# Base URL
BASE_URL="http://localhost:9588/api/v1"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YTBiM2NiNS04NmJhLTQ3NmEtYjc3Ny1iMjk4OTJhNmIwOWUiLCJmdWxsX25hbWUiOiIiLCJyb2xlcyI6WyJTdXBlciBBZG1pbiIsImJhY2tvZmZpY2UiXSwianRpIjoiODU0NTZkZTQtMTVmZi00NjhhLTljMzktOTljNTUyNzVmNzA4IiwiZXhwIjoxNzU3NDA3MDM3LCJpYXQiOjE3NTczNjM4Mzd9.aY8EAPQ3bCe1IAUy9FZU0QBPrKSBP5c2pgPhfNQLItE"

echo "=== Testing All Endpoints dengan Filter dan Pagination ==="
echo ""

# Test Companies
echo "=== COMPANIES ENDPOINT ==="
echo "1. Test Companies Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/companies?page=1&limit=5&is_delete=false" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "2. Test Companies dengan Search dan Sort:"
curl -X 'GET' \
  "${BASE_URL}/companies?search=company&sort_by=company_name&sort_order=asc&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Departments
echo "=== DEPARTMENTS ENDPOINT ==="
echo "3. Test Departments Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/departments?page=1&limit=5&is_delete=false" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "4. Test Departments dengan Search dan Sort:"
curl -X 'GET' \
  "${BASE_URL}/departments?search=hr&sort_by=department_name&sort_order=asc&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Employees
echo "=== EMPLOYEES ENDPOINT ==="
echo "5. Test Employees Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/employees?page=1&limit=5&is_delete=false" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "6. Test Employees dengan Search dan Sort:"
curl -X 'GET' \
  "${BASE_URL}/employees?search=john&sort_by=employee_name&sort_order=asc&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Roles
echo "=== ROLES ENDPOINT ==="
echo "7. Test Roles Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/roles?page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "8. Test Roles dengan Search dan Sort:"
curl -X 'GET' \
  "${BASE_URL}/roles?search=admin&sort_by=role_name&sort_order=asc&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Permissions
echo "=== PERMISSIONS ENDPOINT ==="
echo "9. Test Permissions Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/permissions?page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "10. Test Permissions dengan Search dan Sort:"
curl -X 'GET' \
  "${BASE_URL}/permissions?search=read&sort_by=permission_name&sort_order=asc&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Users
echo "=== USERS ENDPOINT ==="
echo "11. Test Users Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/users?page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "12. Test Users dengan Search dan Sort:"
curl -X 'GET' \
  "${BASE_URL}/users?search=admin&sort_by=user_name&sort_order=asc&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Date Range Filtering
echo "=== DATE RANGE FILTERING TESTS ==="
echo "13. Test Companies dengan Date Range:"
curl -X 'GET' \
  "${BASE_URL}/companies?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "14. Test Employees dengan Date Range:"
curl -X 'GET' \
  "${BASE_URL}/employees?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z&page=1&limit=3" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test Combined Filters
echo "=== COMBINED FILTERS TESTS ==="
echo "15. Test Departments dengan Combined Filters:"
curl -X 'GET' \
  "${BASE_URL}/departments?search=hr&company_id=8a0b3cb5-86ba-476a-b777-b29892a6b09e&sort_by=created_at&sort_order=desc&page=1&limit=2" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "16. Test Users dengan Combined Filters:"
curl -X 'GET' \
  "${BASE_URL}/users?search=admin&role_id=8a0b3cb5-86ba-476a-b777-b29892a6b09e&sort_by=created_at&sort_order=desc&page=1&limit=2" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "=== Testing Complete ==="
