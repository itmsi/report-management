#!/bin/bash

# Contoh curl lengkap untuk endpoint users dengan semua fitur filter dan pagination
# Base URL
BASE_URL="http://localhost:9588/api/v1"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YTBiM2NiNS04NmJhLTQ3NmEtYjc3Ny1iMjk4OTJhNmIwOWUiLCJmdWxsX25hbWUiOiIiLCJyb2xlcyI6WyJTdXBlciBBZG1pbiIsImJhY2tvZmZpY2UiXSwianRpIjoiNzJlMzc2MWUtOGE2OC00NDFmLWI4MzMtYWUzMjk0ODJiMDU5IiwiZXhwIjoxNzU3NDA3NjUwLCJpYXQiOjE3NTczNjQ0NTB9.DXYHygkL3l4vhxMKZoVQ5FD2zjXSujWzwpm34kUwo64"

echo "=== Testing Users API dengan Filter dan Pagination ==="
echo ""

# Test 1: Basic pagination
echo "1. Test Basic Pagination:"
curl -X 'GET' \
  "${BASE_URL}/users?page=1&limit=10" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 2: Search functionality
echo "2. Test Search Functionality (search='admin'):"
curl -X 'GET' \
  "${BASE_URL}/users?search=admin&page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 3: Sorting
echo "3. Test Sorting (sort_by=user_name, sort_order=desc):"
curl -X 'GET' \
  "${BASE_URL}/users?sort_by=user_name&sort_order=desc&page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 4: Filter by role_id
echo "4. Test Filter by Role ID:"
curl -X 'GET' \
  "${BASE_URL}/users?role_id=da665096-f1c7-475c-a429-f07a33ed5309&page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 5: Filter by employee_id
echo "5. Test Filter by Employee ID:"
curl -X 'GET' \
  "${BASE_URL}/users?employee_id=c7e7c7b1-9570-4f2f-9246-48ba9e44aeac&page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 6: Date range filtering
echo "6. Test Date Range Filtering (start_date=2024-01-01):"
curl -X 'GET' \
  "${BASE_URL}/users?start_date=2024-01-01T00:00:00Z&page=1&limit=5" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 7: Combined filters
echo "7. Test Combined Filters (search + sort + pagination):"
curl -X 'GET' \
  "${BASE_URL}/users?search=admin&sort_by=created_at&sort_order=desc&page=1&limit=3&is_delete=false" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""

# Test 8: Get user by ID
echo "8. Test Get User by ID:"
curl -X 'GET' \
  "${BASE_URL}/users/8a0b3cb5-86ba-476a-b777-b29892a6b09e" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "=== Testing Complete ==="
