import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { buildProductStoryMetadata } from "./product-stories";

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

export default async function addGeexProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);

  const salesChannels = await salesChannelService.listSalesChannels();
  if (!salesChannels.length) {
    throw new Error("No sales channel found. Create or seed a store sales channel first.");
  }

  const shippingProfiles = await fulfillmentService.listShippingProfiles({
    type: "default",
  });
  if (!shippingProfiles.length) {
    throw new Error("No default shipping profile found. Run the base Medusa setup first.");
  }

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  if (!stockLocations.length) {
    throw new Error("No stock location found. Run the base Medusa setup first.");
  }

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });

  const categoryByHandle = new Map(
    (existingCategories || []).map((category: any) => [category.handle, category.id])
  );

  const missingCategories = categories.filter(
    (category) => !categoryByHandle.has(category.handle)
  );

  if (missingCategories.length) {
    logger.info(`Creating ${missingCategories.length} GEEX categories...`);
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((category) => ({
          ...category,
          is_active: true,
        })),
      },
    });

    for (const category of result) {
      categoryByHandle.set(category.handle, category.id);
    }
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: {
      handle: products.map((product) => product.handle),
    },
  });

  const existingProductHandles = new Set(
    (existingProducts || []).map((product: any) => product.handle)
  );

  const productsToCreate = products.filter(
    (product) => !existingProductHandles.has(product.handle)
  );

  if (!productsToCreate.length) {
    logger.info("All GEEX products already exist. Nothing to create.");
    return;
  }

  logger.info(`Creating ${productsToCreate.length} GEEX products...`);

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate.map((product) => ({
        title: product.title,
        handle: product.handle,
        subtitle: product.subtitle,
        description: product.description,
        metadata: buildProductStoryMetadata(product.handle),
        category_ids: [categoryByHandle.get(product.category)].filter(Boolean) as string[],
        weight: product.weight,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfiles[0].id,
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
        sales_channels: [{ id: salesChannels[0].id }],
      })),
    },
  });

  const inventoryLevels: any[] = [];
  for (const product of createdProducts) {
    for (const variant of product.variants || []) {
      for (const inventoryItem of (variant as any).inventory_items || []) {
        inventoryLevels.push({
          inventory_item_id: inventoryItem.inventory_item_id,
          location_id: stockLocations[0].id,
          stocked_quantity: 100,
        });
      }
    }
  }

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
  }

  logger.info(`Created ${createdProducts.length} GEEX products.`);
}
