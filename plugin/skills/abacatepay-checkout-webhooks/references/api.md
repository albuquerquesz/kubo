# AbacatePay API reference for this skill

## Essentials

- Base URL: `https://api.abacatepay.com/v2`
- Auth header: `Authorization: Bearer <api-key>`
- Content type: JSON
- Currency: BRL
- Amounts: always centavos
- Response envelope:

```json
{
  "data": {},
  "success": true,
  "error": null
}
```

## Endpoints used by this skill

### Hosted checkout

`POST /checkouts/create`

Use to create a hosted checkout page and redirect the customer to `data.url`.

Required body:

```json
{
  "items": [
    {
      "id": "product_id",
      "quantity": 1
    }
  ]
}
```

Useful optional fields:

- `methods`: payment methods such as `PIX` or `CARD`
- `customerId`
- `returnUrl`
- `completionUrl`
- `coupons`
- `externalId`
- `metadata`

Notes:

- Products must exist before checkout creation.
- Use `externalId` on products as the bridge to the local catalog.

### Products

`POST /products/create`

Use only if the integration needs to provision products automatically.

Required fields:

- `externalId`
- `name`
- `price`
- `currency: "BRL"`

### Customers

`POST /customers/create`

Use when pre-filling checkout or reusing customer records.

Required field:

- `email`

Useful fields:

- `taxId`
- `name`
- `cellphone`
- `zipCode`
- `metadata`

Notes:

- Customers are unique by CPF/CNPJ.
- Creating a customer with an existing `taxId` returns the existing customer.

### Webhooks

`POST /webhooks/create`

Required fields:

- `name`
- `endpoint`
- `secret`
- `events`

Relevant event set for a basic checkout integration:

- `checkout.completed`
- optionally `checkout.refunded`
- optionally `checkout.disputed`
- optionally `checkout.lost`

Notes:

- Endpoint must be public HTTPS.
- Payloads are signed with HMAC using the configured `secret`.
- This reference does not include the exact signature header name. Confirm it from the official webhook docs before implementing verification if the project does not already know it.

## Minimal request shapes

### Create product

```json
{
  "externalId": "plan_basic",
  "name": "Plano Basic",
  "price": 10000,
  "currency": "BRL"
}
```

### Create customer

```json
{
  "email": "cliente@example.com",
  "name": "Cliente Exemplo",
  "taxId": "00000000000"
}
```

### Create checkout

```json
{
  "items": [
    {
      "id": "prod_123",
      "quantity": 1
    }
  ],
  "customerId": "cust_123",
  "returnUrl": "https://app.example.com/billing",
  "completionUrl": "https://app.example.com/billing/success",
  "externalId": "order_123",
  "metadata": {
    "orderId": "order_123"
  }
}
```

## Integration reminders

- Keep the AbacatePay API key server-side only.
- Store AbacatePay IDs on your side for reconciliation.
- Make webhook handling idempotent.
- For post-payment confirmation, trust the verified webhook over client-side redirect alone.
