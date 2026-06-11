# GET /api/images/[...key]

Streams an image from S3 storage.

## Authentication

None — public endpoint.

## Rate Limiting

None.

## Request

### Path Parameter

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` (path segments) | The S3 object key, split across URL path segments. Example: `items/550e8400-e29b-41d4-a716-446655440000/1700000000000-abc123.jpg` |

**Full URL example:**

```
GET /api/images/items/550e8400-e29b-41d4-a716-446655440000/1700000000000-abc123.jpg
```

## Response

### 200 OK

Binary file stream.

| Header | Value |
|---|---|
| `Content-Type` | MIME type from S3 metadata (defaults to `application/octet-stream`). |
| `Cache-Control` | `public, max-age=31536000, immutable` — cached for 1 year. |
| `Content-Length` | Set when available from S3. |

### 404 Not Found

Empty body. Returned when the key does not exist in S3.

## Notes

- Image URLs returned by `/api/items` already include the full path for use with this endpoint.
- The 1-year immutable cache is intentional — S3 keys include a timestamp component, so updated images get new keys rather than overwriting existing ones.
