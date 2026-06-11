# GET /api/items

Returns all active items with their associated images.

## Authentication

None — public endpoint.

## Rate Limiting

None.

## Request

No parameters.

## Response

### 200 OK

```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": "12.50",
    "sizes": ["S", "M", "L"],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "images": [
      {
        "id": "uuid",
        "url": "/api/images/items/{itemId}/filename.jpg",
        "sortOrder": 0
      }
    ]
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | |
| `name` | `string` | |
| `description` | `string` | |
| `price` | `string` | Formatted to 2 decimal places (e.g. `"12.50"`). Stored as integer cents in the database. |
| `sizes` | `string[]` | Available sizes for this item. |
| `status` | `"active"` | Only active items are returned. |
| `createdAt` | `string` (ISO 8601) | |
| `updatedAt` | `string` (ISO 8601) | |
| `images[].id` | `string` (UUID) | |
| `images[].url` | `string` | Path to the image via the image proxy endpoint. |
| `images[].sortOrder` | `number` | Display order, ascending. |

## Notes

- Items are sorted by `createdAt` descending (newest first).
- Images within each item are sorted by `sortOrder` ascending.
- Draft and inactive items are excluded.
- `price` is a formatted string, not a number, to avoid floating-point representation issues. The underlying value is stored in cents (e.g. `1250` for €12.50).
