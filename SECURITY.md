# GEEX Security Guidelines

## Overview

This document outlines security practices for the GEEX Medusa backend.

## Critical Requirements

Never commit secrets to version control. All sensitive values must come from environment variables.

Required production variables include:

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | Secret for JWT token signing |
| `COOKIE_SECRET` | Secret for cookie signing |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `RESEND_API_KEY` | Resend email API key |
| `RESEND_FROM_EMAIL` | Sender address for GEEX transactional email |
| `SUPPORT_EMAIL` | Customer support address |
| `FRONTEND_URL` | Public storefront URL |
| `STORE_CORS` | Storefront CORS origin |
| `ADMIN_CORS` | Admin CORS origin |
| `AUTH_CORS` | Auth CORS origins |
| `STRIPE_API_KEY` | Stripe secret key, when Stripe is enabled |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, when Stripe is enabled |

Generate secure secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Production Checklist

- Set `JWT_SECRET` and `COOKIE_SECRET` to secure random values.
- Configure production PostgreSQL and Redis URLs.
- Set CORS variables to production domains only.
- Configure payment and email provider keys through environment variables.
- Confirm `.env` is ignored by Git.
- Test account creation, order confirmation, checkout, and email delivery.
- Run dependency checks before deployment.

## API Security

- Validate user input at API boundaries.
- Keep internal errors in logs, not client responses.
- Do not log payment details, secrets, discount tokens, or customer credentials.
- Add rate limiting or upstream WAF protection before production launch.

## Vulnerability Reporting

Do not open a public issue for security concerns. Contact:

```text
security@example.com
```

Include reproduction steps, affected endpoint or workflow, and expected impact.
