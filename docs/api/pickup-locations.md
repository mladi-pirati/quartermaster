# GET /api/pickup-locations

Returns all active pickup locations.

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
    "name": "Ljubljana, Miklošičeva 4",
    "address": "Miklošičeva 4",
    "city": "Ljubljana",
    "country": "Slovenia"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | |
| `name` | `string` | Display name for the location. |
| `address` | `string` | Street and number. |
| `city` | `string` | |
| `country` | `string` | |

## Notes

- Only locations with `isActive = true` are returned.
- Results are sorted by `name` ascending (alphabetical).
- Internal fields (`isActive`, `createdAt`, `updatedAt`) are not included in the response.
