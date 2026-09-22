# API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Protection](#api-protection)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)

---

## Overview

The Consoomers API is a RESTful API built with Next.js API routes. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3000/api` (Development)

---

## Authentication

### Authentication Methods

1. **NextAuth Session**
   - Used for web application authentication
   - JWT-based session management
   - Automatic cookie handling

2. **API Token** (Future implementation)
   - For programmatic access
   - Bearer token authentication

### Session Structure
```typescript
{
  user: {
    id: string;
    email: string;
    role: "brand" | "tester" | "admin";
    firstName: string;
    lastName: string;
  }
}
```

### Protected Routes
Access protected routes by including session cookies with requests.

---

## API Protection

### CSRF Protection

All state-changing requests (POST, PUT, DELETE, PATCH) require CSRF tokens.

#### Getting a CSRF Token
```http
GET /api/csrf-token
```

**Response:**
```json
{
  "csrfToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Using CSRF Tokens
Include the token in request headers:
```http
POST /api/product/create-product
X-CSRF-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Using the secureFetch utility:**
```typescript
import { secureAPI } from '@/utils/secureFetch';

// Automatically handles CSRF tokens
const response = await secureAPI.post('/api/product/create-product', {
  name: 'Product Name',
  // ... other fields
});
```

### Excluded Routes
The following routes don't require CSRF tokens:
- `/api/auth/*` - Authentication endpoints
- `/api/csrf-token` - Token generation
- `/api/webhooks/*` - Webhook handlers

---

## Rate Limiting

Rate limits protect endpoints from abuse.

### Default Limits

| Endpoint Pattern | Requests | Window | Cooldown |
|-----------------|----------|---------|----------|
| `/api/auth/register/*` | 10 | 5 min | 10 min |
| `/api/auth/login` | 5 | 15 min | 15 min |
| `/api/auth/forgot-password` | 10 | 5 min | 10 min |
| `/api/product/*` | 100 | 15 min | 5 min |

### Rate Limit Headers
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1704672000000
```

### Rate Limit Response
**Status:** `429 Too Many Requests`
```json
{
  "error": "Too many requests. Try again later."
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions or CSRF validation failed |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Endpoints

### Authentication

#### Register Brand
```http
POST /api/auth/register/brand
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@brand.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "companyName": "Brand Inc",
  "brandName": "Brand",
  "website": "https://brand.com",
  "industry": "Technology",
  "acceptedTerms": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "userId": "uuid",
  "brandId": "uuid"
}
```

---

#### Register Tester
```http
POST /api/auth/register/tester
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@email.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "categoryInterested": ["beauty", "food"],
  "mainInterest": "beauty",
  "country": "US",
  "state": "CA",
  "gender": "female",
  "ageGroup": "25-34",
  "over18": true,
  "acceptedTerms": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "userId": "uuid",
  "testerId": "#TST00000001"
}
```

---

#### Login
```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "user@email.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "role": "tester",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "token": "jwt-token"
}
```

---

#### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@email.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

#### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### User Management

#### Get User
```http
GET /api/user?email=user@email.com
GET /api/user?id=uuid
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "tester",
    "profileImage": "https://...",
    "testerProfile": {
      "testerId": "#TST00000001",
      "categoryInterested": ["beauty"],
      // ... other fields
    }
  }
}
```

---

#### Get Tester Profile
```http
GET /api/testerProfile/[userId]
```

**Response:** `200 OK`
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@email.com",
  "testerId": "#TST00000001",
  "categoryInterested": ["beauty", "food"],
  "profileImage": "https://...",
  // ... other profile fields
}
```

---

### Brand Management

#### Create/Update Brand Profile
```http
POST /api/auth/register/brand/profile
```

**Headers:**
```
X-CSRF-Token: <csrf-token>
```

**Request Body:**
```json
{
  "userId": "uuid",
  "name": "Brand Name",
  "companyName": "Company Inc",
  "website": "https://brand.com",
  "industry": "Technology",
  "description": "Brand description",
  "logo": "media-uuid",
  "coverImage": "media-uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Brand profile updated successfully",
  "brandProfile": {
    "id": "uuid",
    "name": "Brand Name",
    // ... other fields
  }
}
```

---

#### Delete Brand Profile
```http
DELETE /api/auth/register/brand/profile?userId=uuid
```

**Headers:**
```
X-CSRF-Token: <csrf-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Brand profile deleted successfully"
}
```

---

### Product Management

#### Create Product
```http
POST /api/product/create-product
```

**Headers:**
```
X-CSRF-Token: <csrf-token>
```

**Request Body:**
```json
{
  "product": {
    "name": "Product Name",
    "description": "Product description",
    "category": "beauty",
    "price": 29.99,
    "images": ["media-uuid-1", "media-uuid-2"],
    "status": "draft"
  },
  "options": [
    {
      "name": "Color",
      "values": ["Red", "Blue", "Green"]
    }
  ],
  "variants": [
    {
      "name": "Red - Small",
      "sku": "PROD-RED-SM",
      "price": 29.99,
      "inventory": 100,
      "options": { "Color": "Red", "Size": "Small" }
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "uuid",
    "name": "Product Name",
    // ... other fields
  }
}
```

---

#### Update Product
```http
PATCH /api/product/create-product
```

**Headers:**
```
X-CSRF-Token: <csrf-token>
```

**Request Body:**
```json
{
  "productId": "uuid",
  "product": {
    "name": "Updated Product Name",
    "description": "Updated description",
    "price": 39.99
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { /* updated product */ }
}
```

---

#### Delete Product
```http
DELETE /api/product/create-product?productId=uuid
```

**Headers:**
```
X-CSRF-Token: <csrf-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

#### Get Product
```http
GET /api/product/[productId]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "images": [
      {
        "id": "uuid",
        "src": "https://...",
        "alt": "Product image"
      }
    ],
    "brand": {
      "id": "uuid",
      "name": "Brand Name"
    },
    // ... other fields
  }
}
```

---

### Reviews

#### Submit Product Review
```http
POST /api/product/review
```

**Headers:**
```
X-CSRF-Token: <csrf-token>
```

**Request Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "title": "Great product!",
  "content": "This product exceeded my expectations...",
  "images": ["media-uuid-1", "media-uuid-2"],
  "verified": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "review": {
    "id": "uuid",
    "productId": "uuid",
    "rating": 5,
    "title": "Great product!",
    "content": "This product exceeded my expectations...",
    "createdAt": "2024-01-05T12:00:00Z"
  }
}
```

---

#### Get Product Reviews
```http
GET /api/product/[productId]/reviews
```

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "title": "Great product!",
      "content": "This product exceeded my expectations...",
      "testerName": "Jane S.",
      "verified": true,
      "createdAt": "2024-01-05T12:00:00Z",
      "images": [/* ... */]
    }
  ],
  "totalReviews": 45,
  "averageRating": 4.5
}
```

---

### Media Upload

#### Upload Media
```http
POST /api/upload
```

**Headers:**
```
Content-Type: multipart/form-data
X-CSRF-Token: <csrf-token>
```

**Request Body (FormData):**
```
file: File
folder: string (optional, default: "/media")
customFileName: string (optional)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "media": {
    "id": "uuid",
    "src": "https://bucket.s3.amazonaws.com/path/to/file.jpg",
    "key": "path/to/file.jpg",
    "type": "image",
    "format": "jpg",
    "size": 1024000,
    "alt": "filename"
  }
}
```

---

### Dashboard

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
```

**Response:** `200 OK`
```json
{
  "products": {
    "total": 150,
    "active": 120,
    "draft": 30
  },
  "testers": {
    "total": 5000,
    "active": 4200,
    "newThisMonth": 450
  },
  "reviews": {
    "total": 12500,
    "averageRating": 4.3,
    "thisMonth": 850
  },
  "revenue": {
    "thisMonth": 45000,
    "lastMonth": 38000,
    "growth": 18.4
  }
}
```

---

#### Get Sample Requests
```http
GET /api/dashboard/sample-request
GET /api/dashboard/sample-request?testerId=uuid
GET /api/dashboard/sample-request?productId=uuid
GET /api/dashboard/sample-request?status=pending
```

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Product Name"
      },
      "tester": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "status": "pending",
      "notes": "Sample request notes",
      "requestedAt": "2024-01-05T12:00:00Z"
    }
  ]
}
```

---

### Admin Endpoints

#### Get All Reviews
```http
GET /api/dashboard/reviews
```

**Permissions:** Admin only

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "uuid",
      "product": "Product Name",
      "tester": "Jane Smith",
      "rating": 5,
      "title": "Great product!",
      "content": "...",
      "createdAt": "2024-01-05T12:00:00Z"
    }
  ]
}
```

---

## Security Best Practices

### Client-Side

1. **Always use secureFetch utility**
   ```typescript
   import { secureAPI } from '@/utils/secureFetch';
   await secureAPI.post('/api/endpoint', data);
   ```

2. **Handle CSRF tokens automatically**
   - Token is fetched and cached in sessionStorage
   - Automatically refreshed on expiration
   - Retries once on 403 CSRF errors

3. **Never store sensitive data in localStorage**
   - Use session cookies for authentication
   - Clear sensitive data on logout

### Server-Side

1. **Always use CSRF protection for state-changing operations**
   ```typescript
   import { withCSRFProtection } from '@/libs/csrf/csrfMiddleware';
   
   export async function POST(req: NextRequest) {
     const csrf = await withCSRFProtection(req);
     if (csrf) return csrf;
     // ... your logic
   }
   ```

2. **Validate all inputs with Zod**
   ```typescript
   const schema = z.object({
     name: z.string().min(1).max(100),
     email: z.string().email(),
   });
   
   const validated = schema.parse(body);
   ```

3. **Use rate limiting on sensitive endpoints**
   ```typescript
   const rateLimitResult = await checkRateLimit(ip, {
     route: "/api/endpoint",
     limit: 10,
     windowMs: 5 * 60 * 1000,
     blockMs: 10 * 60 * 1000,
   });
   ```

4. **Check permissions before operations**
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
   }
   ```

---

## Webhooks (Future)

### Webhook Signature Verification
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

---

## Support

For API support:
- Email: ravinwebsurgeon@gmail.com

