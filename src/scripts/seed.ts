import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";
import { buildProductStoryMetadata } from "./product-stories";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => ({
      selector: { id: data.input.store_id },
      update: {
        supported_currencies: data.input.supported_currencies.map((currency) => ({
          currency_code: currency.currency_code,
          is_default: currency.is_default ?? false,
        })),
      },
    }));

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

const countries = ["gb", "de", "dk", "se", "fr", "es", "it", "nl", "be"];
const paymentProviders = process.env.STRIPE_API_KEY
  ? ["pp_stripe_stripe"]
  : ["pp_system_default"];

const categories = [
  {
    name: "Desk Setups",
    handle: "desk-setups",
    description: "Desk mats, hubs, stands, lighting, charging, and setup tools.",
  },
  {
    name: "Office Keyboards",
    handle: "keyboards",
    description: "Mechanical and low-profile keyboards for focused daily work.",
  },
  {
    name: "Gaming Peripherals",
    handle: "gaming",
    description: "Mice, pads, controllers, and performance accessories.",
  },
  {
    name: "Mobile & Tablet",
    handle: "mobile-tablet",
    description: "Phone, tablet, charging, protection, and travel accessories.",
  },
  {
    name: "Bluetooth Audio",
    handle: "audio",
    description: "Earbuds, speakers, and low-latency wireless audio gear.",
  },
];

const products = [
  {
    title: "GEEX A75 Mechanical Keyboard",
    handle: "geex-a75-mechanical-keyboard",
    subtitle: "Compact 75% keyboard with hot-swap switches",
    description:
      "A compact mechanical keyboard with a gasket-style typing feel, durable PBT keycaps, blue accent lighting, and USB-C / wireless modes for clean desk setups.",
    category: "keyboards",
    weight: 820,
    sku: "GEEX-A75-ICE",
    price: { gbp: 8999, eur: 10499, usd: 8999 },
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=90&w=1200",
    option: "Ice White",
  },
  {
    title: "GEEX M2 Pro Wireless Mouse",
    handle: "geex-m2-pro-wireless-mouse",
    subtitle: "Lightweight precision mouse for work and play",
    description:
      "A responsive wireless mouse with a comfortable shell, low-latency connection, programmable buttons, and a smooth sensor tuned for gaming desks and daily productivity.",
    category: "gaming",
    weight: 96,
    sku: "GEEX-M2-PRO",
    price: { gbp: 5999, eur: 6999, usd: 5999 },
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=90&w=1200",
    option: "Graphite",
  },
  {
    title: "GEEX Pods X1",
    handle: "geex-pods-x1",
    subtitle: "Bluetooth earbuds with low-latency mode",
    description:
      "Compact Bluetooth earbuds with clear call pickup, quick pairing, USB-C charging, and a low-latency mode for videos, calls, and casual gaming.",
    category: "audio",
    weight: 62,
    sku: "GEEX-PODS-X1",
    price: { gbp: 4999, eur: 5799, usd: 4999 },
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=90&w=1200",
    option: "Black",
  },
  {
    title: "GEEX Desk Mat Pro XL",
    handle: "geex-desk-mat-pro-xl",
    subtitle: "Extended desk mat for keyboard and mouse setups",
    description:
      "A large anti-slip desk mat with a smooth control surface, stitched edges, and a clean black finish designed to anchor keyboards, mice, and charging gear.",
    category: "desk-setups",
    weight: 540,
    sku: "GEEX-MAT-PRO-XL",
    price: { gbp: 1999, eur: 2399, usd: 1999 },
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=90&w=1200",
    option: "XL",
  },
  {
    title: "GEEX 100W USB-C Cable",
    handle: "geex-100w-usb-c-cable",
    subtitle: "Fast charging cable for laptops, tablets, and phones",
    description:
      "A braided USB-C cable rated for up to 100W charging, with reinforced connectors and a flexible build for desk, travel, and docking station use.",
    category: "mobile-tablet",
    weight: 80,
    sku: "GEEX-CABLE-100W",
    price: { gbp: 1299, eur: 1499, usd: 1299 },
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=90&w=1200",
    option: "1.8m",
  },
  {
    title: "GEEX Adjustable Tablet Stand",
    handle: "geex-adjustable-tablet-stand",
    subtitle: "Aluminum stand for phone and tablet workflows",
    description:
      "A foldable aluminum stand with stable hinges, desk-friendly viewing angles, and support for phones, tablets, video calls, notes, and second-screen workflows.",
    category: "mobile-tablet",
    weight: 310,
    sku: "GEEX-STAND-ALU",
    price: { gbp: 2999, eur: 3499, usd: 2999 },
    image:
      "https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&q=90&w=1200",
    option: "Aluminum",
  },
  {
    title: "GEEX Orbit Dock 7-in-1",
    handle: "geex-orbit-dock-7-in-1",
    subtitle: "USB-C hub for clean desk connectivity",
    description:
      "A compact 7-in-1 USB-C hub with HDMI, USB-A, USB-C power pass-through, card reader, and Ethernet support for laptop and tablet desk setups.",
    category: "desk-setups",
    weight: 145,
    sku: "GEEX-DOCK-7IN1",
    price: { gbp: 4499, eur: 5299, usd: 4499 },
    image:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=90&w=1200",
    option: "Space Gray",
  },
  {
    title: "GEEX Control Pad",
    handle: "geex-control-pad",
    subtitle: "Macro pad for shortcuts and streaming controls",
    description:
      "A compact programmable macro pad with tactile keys, swappable legends, and USB-C connectivity for creators, gamers, and productivity shortcuts.",
    category: "gaming",
    weight: 220,
    sku: "GEEX-CONTROL-PAD",
    price: { gbp: 3999, eur: 4699, usd: 3999 },
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=90&w=1200",
    option: "Black",
  },
];

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info("Seeding GEEX store data...");
  const [store] = await storeModuleService.listStores();

  await storeModuleService.updateStores(store.id, {
    name: "GEEX",
  });

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "GEEX Storefront",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "GEEX Storefront",
            description: "Curated electronics and setup accessories",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "gbp", is_default: true },
        { currency_code: "eur" },
        { currency_code: "usd" },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United Kingdom",
          currency_code: "gbp",
          countries: ["gb"],
          payment_providers: paymentProviders,
        },
        {
          name: "Europe",
          currency_code: "eur",
          countries: ["de", "dk", "se", "fr", "es", "it", "nl", "be"],
          payment_providers: paymentProviders,
        },
      ],
    },
  });
  const ukRegion = regionResult[0];
  const euRegion = regionResult[1];

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "GEEX Fulfillment Hub",
          address: {
            city: "London",
            country_code: "GB",
            address_1: "100 Setup Way",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "GEEX Standard Shipping",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "GEEX Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "UK & Europe",
        geo_zones: countries.map((code) => ({
          country_code: code,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Tracked Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Tracked Standard",
          description: "Tracked delivery in 3-5 business days.",
          code: "tracked-standard",
        },
        prices: [
          { currency_code: "gbp", amount: 499 },
          { currency_code: "eur", amount: 599 },
          { currency_code: "usd", amount: 699 },
          { region_id: ukRegion.id, amount: 499 },
          { region_id: euRegion.id, amount: 599 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Tracked Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Tracked Express",
          description: "Tracked delivery in 1-2 business days.",
          code: "tracked-express",
        },
        prices: [
          { currency_code: "gbp", amount: 999 },
          { currency_code: "eur", amount: 1199 },
          { currency_code: "usd", amount: 1399 },
          { region_id: ukRegion.id, amount: 999 },
          { region_id: euRegion.id, amount: 1199 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Free Shipping (Orders over 75)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Free Shipping",
          description: "Complimentary tracked shipping on eligible orders.",
          code: "free-shipping",
        },
        prices: [
          { currency_code: "gbp", amount: 0 },
          { currency_code: "eur", amount: 0 },
          { currency_code: "usd", amount: 0 },
          { region_id: ukRegion.id, amount: 0 },
          { region_id: euRegion.id, amount: 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "GEEX Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info("Seeding product categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: categories.map((category) => ({
        ...category,
        is_active: true,
      })),
    },
  });

  const categoryByHandle = new Map(
    categoryResult.map((category) => [category.handle, category.id])
  );

  logger.info("Seeding GEEX products...");
  await createProductsWorkflow(container).run({
    input: {
      products: products.map((product) => ({
        title: product.title,
        handle: product.handle,
        subtitle: product.subtitle,
        description: product.description,
        metadata: buildProductStoryMetadata(product.handle),
        category_ids: [categoryByHandle.get(product.category)].filter(Boolean) as string[],
        weight: product.weight,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        thumbnail: product.image,
        images: [{ url: product.image }],
        options: [{ title: "Style", values: [product.option] }],
        variants: [
          {
            title: product.option,
            sku: product.sku,
            manage_inventory: true,
            options: { Style: product.option },
            prices: [
              { amount: product.price.gbp, currency_code: "gbp" },
              { amount: product.price.eur, currency_code: "eur" },
              { amount: product.price.usd, currency_code: "usd" },
            ],
          },
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }],
      })),
    },
  });

  logger.info("Seeding inventory levels.");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    inventoryLevels.push({
      location_id: stockLocation.id,
      stocked_quantity: 100,
      inventory_item_id: inventoryItem.id,
    });
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("======================================");
  logger.info("GEEX seed data complete!");
  logger.info(`Publishable API Key: ${(publishableApiKey as any).token || "Check admin panel"}`);
  logger.info("======================================");
}
