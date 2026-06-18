# GEEX Frontend Cart & Checkout Guide

This document mirrors the storefront cart integration notes for GEEX.

Base URL:

```text
http://localhost:9030/store
```

Example cart item:

```json
{
  "title": "GEEX A75 Mechanical Keyboard",
  "quantity": 1,
  "unit_price": 8999,
  "currency_code": "usd"
}
```

Use the public Medusa Store API with the configured publishable API key. Never expose secret admin or payment keys to the browser.
