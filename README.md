# GEEX Backend

Medusa v2 backend for the GEEX electronics storefront.

GEEX sells desk setup accessories, office keyboards, gaming peripherals, mobile and tablet accessories, charging gear, and Bluetooth audio. The backend provides products, carts, checkout, customer accounts, email notifications, promotions, and admin workflows.

## Local Services

PostgreSQL and Redis are expected to run from Docker in local development.

```bash
npm install
npm run dev
```

Default local API:

```text
http://localhost:9030
```

## Seed Data

Run the GEEX seed script to create store basics, regions, shipping, categories, products, inventory, and a publishable API key.

```bash
npm run seed
```

To archive legacy demo products/categories in an existing database:

```bash
npx medusa exec ./src/scripts/archive-legacy-catalog-data.ts
```

To add only GEEX catalog products to an existing setup:

```bash
npx medusa exec ./src/scripts/add-geex-products.ts
```

## Important Environment Variables

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medusa_geex
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
COOKIE_SECRET=...
STORE_CORS=http://localhost:3030
ADMIN_CORS=http://localhost:9030
AUTH_CORS=http://localhost:3030,http://localhost:9030
RESEND_API_KEY=...
RESEND_FROM_EMAIL=GEEX <noreply@example.com>
SUPPORT_EMAIL=support@example.com
FRONTEND_URL=http://localhost:3030
```

## Notes

- Do not run old pre-GEEX seed scripts from prior commits.
- GEEX storefront products should use `geex-*` handles.
- The current global storefront is English-first.
