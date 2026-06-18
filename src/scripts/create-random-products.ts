import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

const productData = [
  {
    title: "GEEX Low Profile Keyboard",
    subtitle: "Slim wireless keyboard for desk setups",
    description: "A slim wireless keyboard with quiet switches, USB-C charging, and a compact layout for laptops, tablets, and clean office desks.",
    category: "keyboards",
  },
  {
    title: "GEEX RGB Mouse Pad",
    subtitle: "Desk mat with edge lighting",
    description: "A smooth control surface with stitched edges and subtle RGB edge lighting for gaming and productivity setups.",
    category: "gaming",
  },
  {
    title: "GEEX Magnetic Phone Stand",
    subtitle: "Adjustable stand for calls and charging",
    description: "A compact magnetic stand with stable hinges for video calls, charging, and second-screen workflows.",
    category: "mobile-tablet",
  },
  {
    title: "GEEX ANC Earbuds Lite",
    subtitle: "Bluetooth earbuds for travel and calls",
    description: "Lightweight Bluetooth earbuds with quick pairing, call microphones, USB-C charging, and a pocketable case.",
    category: "audio",
  },
  {
    title: "GEEX Desk Cable Kit",
    subtitle: "Cable clips, ties, and routing sleeves",
    description: "A practical cable management kit for routing chargers, monitor leads, keyboard cables, and docking station wiring.",
    category: "desk-setups",
  },
];

const styles = ["Black", "Ice Gray", "Orbit Blue", "Graphite", "White"];

function getRandomPrice(): number {
  return Math.floor(Math.random() * 7001) + 1999;
}

export default async function createRandomProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);

  logger.info("Creating random GEEX electronics products...");

  const salesChannels = await salesChannelService.listSalesChannels();
  if (!salesChannels.length) {
    throw new Error("No sales channel found. Run seed first.");
  }

  const shippingProfiles = await fulfillmentService.listShippingProfiles({
    type: "default",
  });
  if (!shippingProfiles.length) {
    throw new Error("No shipping profile found. Run seed first.");
  }

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });
  const categoryByHandle = new Map((categories || []).map((category: any) => [category.handle, category.id]));

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  if (!stockLocations.length) {
    throw new Error("No stock location found. Run seed first.");
  }

  const productsToCreate = productData.map((product, index) => {
    const selectedStyle = styles[index % styles.length];
    const priceUsd = getRandomPrice();
    const priceGbp = Math.floor(priceUsd * 0.79);
    const priceEur = Math.floor(priceUsd * 0.92);

    return {
      title: product.title,
      handle: product.title.toLowerCase().replace(/\s+/g, "-"),
      subtitle: product.subtitle,
      description: product.description,
      category_ids: [categoryByHandle.get(product.category)].filter(Boolean) as string[],
      weight: 100 + index * 45,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfiles[0].id,
      images: [
        { url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=90&w=1200" },
      ],
      options: [{ title: "Style", values: [selectedStyle] }],
      variants: [
        {
          title: selectedStyle,
          sku: `${product.title.toUpperCase().replace(/\s+/g, "-")}-${selectedStyle.toUpperCase().replace(/\s+/g, "")}`,
          options: { Style: selectedStyle },
          manage_inventory: true,
          prices: [
            { amount: priceUsd, currency_code: "usd" },
            { amount: priceGbp, currency_code: "gbp" },
            { amount: priceEur, currency_code: "eur" },
          ],
        },
      ],
      sales_channels: [{ id: salesChannels[0].id }],
    };
  });

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: { products: productsToCreate },
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

  logger.info(`Created ${createdProducts.length} random GEEX products.`);
}
