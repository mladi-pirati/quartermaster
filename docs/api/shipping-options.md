# GET /api/shipping-options

Returns all active shipping options.

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
    "name": "Standard Shipping",
    "estimatedDeliveryTime": "2–3 business days",
    "price": 3.99
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | |
| `name` | `string` | Display name for the shipping option. |
| `estimatedDeliveryTime` | `string` | Human-readable delivery estimate, e.g. `"2–3 business days"`. |
| `price` | `number` | Shipping cost in euros, always two decimal places (e.g. `3.99`). |

## Notes

- Only options with `isActive = true` are returned.
- Results are sorted by `name` ascending (alphabetical).
- Internal fields (`isActive`, `createdAt`, `updatedAt`) are not included in the response.
