# POST /api/orders

Submits a new order.

## Authentication

None — public endpoint.

## Rate Limiting

10 requests per 10 minutes per IP address. When the limit is exceeded, the response includes a `Retry-After` header (seconds until the window resets) and an error body with `code: "captcha_required"`.

Providing a valid Cloudflare Turnstile `captchaToken` bypasses rate limiting entirely.

## Request

**Content-Type:** `application/json`

### Body

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+386 40 123 456",
  "deliveryType": "shipping",
  "address": "Slovenska cesta 1",
  "city": "Ljubljana",
  "postalCode": "1000",
  "country": "SI",
  "pickupLocationId": null,
  "notes": "Please pack carefully.",
  "captchaToken": "0.token...",
  "items": [
    { "itemId": "uuid", "size": "M", "quantity": 2 }
  ]
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `fullName` | `string` | Yes | Min 2 characters. |
| `email` | `string` | Yes | Valid email address. |
| `phone` | `string` | No | |
| `deliveryType` | `"shipping" \| "pickup"` | Yes | |
| `address` | `string` | Conditional | Required when `deliveryType` is `"shipping"`. |
| `city` | `string` | Conditional | Required when `deliveryType` is `"shipping"`. |
| `postalCode` | `string` | Conditional | Required when `deliveryType` is `"shipping"`. |
| `country` | `string` | Conditional | Required when `deliveryType` is `"shipping"`. |
| `pickupLocationId` | `string` (UUID) | Conditional | Required when `deliveryType` is `"pickup"`. Must reference an active pickup location. |
| `notes` | `string` | No | Max 500 characters. |
| `captchaToken` | `string` | No | Cloudflare Turnstile token. Bypasses rate limiting when valid. |
| `items` | `array` | Yes | At least 1 item required. |
| `items[].itemId` | `string` (UUID) | Yes | Must reference an active item. |
| `items[].size` | `string` | Yes | Must be a valid size for that item. |
| `items[].quantity` | `number` | Yes | Positive integer. |

## Response

### 201 Created

```json
{ "orderId": "uuid" }
```

### 400 Bad Request

Validation error or invalid captcha token:

```json
{ "error": "Descriptive error message." }
```

Or, when the captcha token is explicitly invalid:

```json
{ "code": "captcha_invalid" }
```

### 429 Too Many Requests

Rate limit exceeded. Includes a `Retry-After` header.

```json
{ "code": "captcha_required" }
```

## Notes

- Item name and price are snapshotted at the time of order creation, so future edits to an item do not affect historical orders.
- The order and all its line items are created in a single database transaction.
- Client IP is read from the `x-forwarded-for` header (first value), falling back to `"unknown"` if absent.
