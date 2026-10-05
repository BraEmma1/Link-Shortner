# API Endpoints

Base path: `/api`. All endpoints are public. Responses are JSON with a `success` boolean (errors have an `error` message).

## GET /api/health
API and MongoDB status. Returns `503` with `status: "degraded"` when MongoDB is not connected.

## POST /api/shorten
Body: `{ "targetUrl": "https://example.com/long", "customSlug": "optional" }`

`201`:
```json
{
  "success": true,
  "link": {
    "slug": "galamsey",
    "targetUrl": "https://example.com/long",
    "shortUrl": "https://vlz.link/galamsey",
    "clicks": 0,
    "createdAt": "2026-10-05T10:00:00.000Z"
  }
}
```
Errors: `400` invalid URL, URL on the short domain itself, slug too short/long or reserved (`api`, `health`); `409` slug already in use; `429` rate limited (30 per 15 minutes per IP).

## GET /api/stats/:slug
Returns the same `link` object with the current `clicks`. `404` if the slug does not exist.

## GET /:slug
Redirects (`302`) to the target URL and adds 1 to `clicks`. Unknown or inactive slugs return a 404 page.
