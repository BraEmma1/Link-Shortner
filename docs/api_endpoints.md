# Vaultz Links API Specification

This document details the HTTP REST API endpoints exposed by the Vaultz Links Express backend server.

---

## 1. Global Authentication
Protected endpoints require a standard JWT token sent in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token_here>
```
If the token is invalid, expired, or missing, the API responds with a `401 Unauthorized` status:
```json
{
  "success": false,
  "error": "Not authorized — invalid or expired token."
}
```

---

## 2. Public Endpoints

### 2.1 Health Check
* **Route**: `GET /api/health`
* **Description**: Confirms api status, timestamp, and environment.

#### Response (200 OK)
```json
{
  "success": true,
  "status": "ok",
  "service": "Vaultz Links API",
  "timestamp": "2026-06-02T01:11:47Z",
  "environment": "development"
}
```

### 2.2 Short URL Redirect Engine
* **Route**: `GET /:slug`
* **Description**: Looks up the short slug and redirects the visitor immediately using a `302 Found` header. Background tracking parses browser agent details and registers country location.
* **Redirection Limit**: 1000 requests per minute per IP.

#### Response (302 Found)
* Header: `Location: https://thevaultzmedia.com/promotions`

---

## 3. Authentication Endpoints

### 3.1 WordPress Auth Sync Login
* **Route**: `POST /api/auth/wp-login`
* **Description**: Verifies WordPress credentials against the WordPress JSON API JWT token generator. Syncs user data into local MongoDB and returns the JWT.
* **Rate Limit**: 15 requests per 15 minutes per IP.

#### Request Body
```json
{
  "email": "admin@vaultzlinks.io",
  "password": "your_secure_password"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "603d2e3df1258b14a485fae4",
    "wpUserId": 1,
    "name": "Admin User",
    "email": "admin@vaultzlinks.io",
    "role": "admin",
    "lastLogin": "2026-06-02T01:11:47Z"
  }
}
```

### 3.2 Current Session Details
* **Route**: `GET /api/auth/me`
* **Access**: Private (Requires JWT)
* **Description**: Returns session profile metadata of the current authenticated user.

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "603d2e3df1258b14a485fae4",
    "wpUserId": 1,
    "name": "Admin User",
    "email": "admin@vaultzlinks.io",
    "role": "admin",
    "lastLogin": "2026-06-02T01:11:47Z",
    "createdAt": "2026-06-02T01:00:00Z"
  }
}
```

---

## 4. Links Management

### 4.1 Get Links List (Paginated & Searchable)
* **Route**: `GET /api/links`
* **Access**: Private (Requires JWT)
* **Description**: Returns all links owned by the user. Supports pagination, title/slug search, and status filter.
* **Query Parameters**:
  - `page` (default `1`): Number.
  - `limit` (default `10`): Number.
  - `search`: String (escaped to prevent ReDoS).
  - `status`: String (e.g. `active`, `inactive`).

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "603d2ebd...",
      "title": "Promo Link",
      "slug": "promo",
      "targetUrl": "https://target-url.com/landing",
      "clicks": 42,
      "status": "active",
      "createdAt": "2026-06-02T01:00:00Z",
      "shortUrl": "http://localhost:5000/promo"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 4.2 Create Link
* **Route**: `POST /api/links`
* **Access**: Private (Requires JWT)
* **Description**: Shortens a new URL and automatically generates QR code metadata parameters.

#### Request Body
```json
{
  "targetUrl": "https://target-url.com/landing",
  "title": "Promo Link",
  "customSlug": "promo"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "link": {
    "_id": "603d2ebd...",
    "title": "Promo Link",
    "slug": "promo",
    "targetUrl": "https://target-url.com/landing",
    "shortUrl": "http://localhost:5000/promo",
    "clicks": 0,
    "status": "active",
    "createdAt": "2026-06-02T01:11:47Z"
  }
}
```

### 4.3 Update Link
* **Route**: `PATCH /api/links/:id`
* **Access**: Private (Requires JWT)
* **Description**: Modifies properties of a link.

#### Request Body
```json
{
  "title": "Updated Title",
  "status": "inactive"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "link": {
    "_id": "603d2ebd...",
    "title": "Updated Title",
    "slug": "promo",
    "targetUrl": "https://target-url.com/landing",
    "clicks": 42,
    "status": "inactive",
    "createdAt": "2026-06-02T01:00:00Z",
    "shortUrl": "http://localhost:5000/promo"
  }
}
```

### 4.4 Delete Link
* **Route**: `DELETE /api/links/:id`
* **Access**: Private (Requires JWT)
* **Description**: Deletes a link and performs cascade deletion on its related `QRCode` and `Analytics` records.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {}
}
```

---

## 5. Analytics Reports

### 5.1 Overall Stats
* **Route**: `GET /api/analytics/overall`
* **Access**: Private (Requires JWT)
* **Description**: Returns aggregates for all the user's active links, device breakdowns, clicks timelines (last 30 days), and top performing links.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalClicks": 1240,
    "topLinks": [],
    "dailyClicks": [
      { "date": "2026-06-02", "clicks": 45 }
    ],
    "totalLinksCount": 8,
    "activeLinksCount": 7,
    "clicksToday": 45,
    "deviceBreakdown": [
      { "device": "Mobile", "count": 890 }
    ],
    "trafficSources": [
      { "source": "Direct", "count": 500 }
    ]
  }
}
```

### 5.2 Single Link Detailed Analytics
* **Route**: `GET /api/analytics/:linkId`
* **Access**: Private (Requires JWT)
* **Description**: Returns detailed geographic distribution, browser, and OS breakdowns for a single link.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "linkDetails": {
      "title": "Promo Link",
      "shortUrl": "http://localhost:5000/promo",
      "originalUrl": "https://target-url.com/landing",
      "totalClicks": 120,
      "uniqueVisitors": 95,
      "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAA..."
    },
    "dailyClicks": [],
    "trafficSources": [],
    "deviceBreakdown": [],
    "browserBreakdown": [],
    "osBreakdown": [],
    "geographicDistribution": [
      { "country": "US", "count": 80, "percentage": 67 }
    ]
  }
}
```

---

## 6. QR Code Center

### 6.1 Get QR Codes List (Paginated)
* **Route**: `GET /api/qrcodes`
* **Access**: Private (Requires JWT)
* **Description**: Fetches styling parameters and previews (base64) of QR Codes linked to user URLs.

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "603d2ee1...",
      "link": {
        "_id": "603d2ebd...",
        "title": "Promo Link",
        "slug": "promo",
        "shortUrl": "http://localhost:5000/promo"
      },
      "metadata": {
        "foregroundColor": "#000000",
        "backgroundColor": "#ffffff",
        "margin": 4,
        "errorCorrectionLevel": "M"
      },
      "pngData": "data:image/png;base64,iVBORw0KGgo...",
      "scans": 42,
      "createdAt": "2026-06-02T01:11:47Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

### 6.2 Download QR Code File
* **Route**: `GET /api/qrcodes/:id/download`
* **Access**: Private (Requires JWT)
* **Description**: Streams the QR Code image as a downloadable attachment file.
* **Query Parameters**:
  - `type` (options `png`, `svg` - default `png`): Output download format.

#### Response (200 OK)
* Headers:
  - `Content-Type: image/png` (or `image/svg+xml`)
  - `Content-Disposition: attachment; filename="qrcode-promo.png"`
* Body: Binary buffer streams.
