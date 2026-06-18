# GEEX Backend 项目文档

GEEX Backend 是基于 Medusa v2 的电子产品电商后端，服务于 GEEX 英文全球站。

## 定位

GEEX 售卖桌面搭配、办公键盘、游戏外设、手机和平板配件、充电配件、蓝牙耳机等电子产品。

## 技术栈

- Medusa v2
- PostgreSQL
- Redis
- Resend transactional email
- Stripe/payment provider integration through Medusa

## 本地服务

```bash
npm install
npm run dev
```

默认后端地址：

```text
http://localhost:9030
```

## 初始化数据

```bash
npm run seed
```

当前 seed 会创建：

- GEEX 店铺
- GEEX Storefront 销售渠道
- 英国和欧洲区域
- GEEX Fulfillment Hub
- Tracked Standard / Tracked Express / Free Shipping
- Desk Setups、Office Keyboards、Gaming Peripherals、Mobile & Tablet、Bluetooth Audio
- 8 个 GEEX 示例商品

## 常用脚本

```bash
npx medusa exec ./src/scripts/add-geex-products.ts
npx medusa exec ./src/scripts/archive-legacy-catalog-data.ts
npx medusa exec ./src/scripts/create-admin-user.ts
```

## 环境变量

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
