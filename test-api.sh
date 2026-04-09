#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"

echo -e "${BLUE}Starting API Test Suite...${NC}\n"

# Test 1: Health check
echo -e "${BLUE}1. Health Check${NC}"
curl -s -X GET "$API_URL/health" | jq .
echo ""

# Test 2: Register user
echo -e "${BLUE}2. Register New User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "testpass123"
  }')
echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo "Token: $TOKEN"
echo ""

# Test 3: Login
echo -e "${BLUE}3. Login User${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo ""

# Test 4: Get all users (protected)
echo -e "${BLUE}4. Get All Users (Protected)${NC}"
curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Get user profile
echo -e "${BLUE}5. Get User Profile (Protected)${NC}"
curl -s -X GET "$API_URL/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 6: Update user
echo -e "${BLUE}6. Update User Profile (Protected)${NC}"
curl -s -X PUT "$API_URL/api/users/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updateduser",
    "email": "updated@example.com"
  }' | jq .
echo ""

# Test 7: Try accessing protected route without token
echo -e "${BLUE}7. Access Protected Route Without Token (Should Fail)${NC}"
curl -s -X GET "$API_URL/api/users" | jq .
echo ""

echo -e "${GREEN}API Test Suite Complete!${NC}"
