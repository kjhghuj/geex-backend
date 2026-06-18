# GEEX Store API Notes

Base URL:

```text
http://localhost:9030/store
```

All Store API requests require the publishable API key header:

```text
x-publishable-api-key: YOUR_PUBLISHABLE_KEY
```

## Products

List GEEX products:

```bash
curl http://localhost:9030/store/products \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY"
```

Expected catalog examples:

```json
[
  { "title": "GEEX A75 Mechanical Keyboard", "handle": "geex-a75-mechanical-keyboard" },
  { "title": "GEEX M2 Pro Wireless Mouse", "handle": "geex-m2-pro-wireless-mouse" },
  { "title": "GEEX Pods X1", "handle": "geex-pods-x1" }
]
```

## Cart

Create cart:

```bash
curl -X POST http://localhost:9030/store/carts \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY" \
  -d '{"region_id":"reg_..."}'
```

Add item:

```bash
curl -X POST http://localhost:9030/store/carts/cart_.../line-items \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY" \
  -d '{"variant_id":"variant_...","quantity":1}'
```

## Customer Email Check

```bash
curl -X POST http://localhost:9030/store/check-email \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY" \
  -d '{"email":"customer@example.com"}'
```
