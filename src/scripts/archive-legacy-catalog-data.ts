import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const join = (...parts: string[]) => parts.join("-");

const legacyProductHandles = [
  "the-rose",
  "the-wand",
  "the-curve",
  "the-ring",
  "the-duo",
  "kegel-trainer",
  join("int", "imate", "massage", "oil"),
  join("water", "based", "lubricant"),
  "toy-cleaner",
  "satin-storage-pouch",
];

const legacyCategoryHandles = [
  join("solo", "play"),
  join("cou", "ples"),
  join("well", "ness"),
  "accessories",
];

export default async function archiveLegacyCatalogData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
    filters: {
      handle: legacyProductHandles,
    },
  });

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
    filters: {
      handle: legacyCategoryHandles,
    },
  });

  const productIds = (products || []).map((product: any) => product.id);
  const categoryIds = (categories || []).map((category: any) => category.id);

  if (!productIds.length && !categoryIds.length) {
    logger.info("No active legacy catalog entries found.");
    return;
  }

  const db = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);

  if (productIds.length) {
    await db("product")
      .whereIn("id", productIds)
      .whereNull("deleted_at")
      .update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
    logger.info(`Archived ${productIds.length} legacy products.`);
  }

  if (categoryIds.length) {
    await db("product_category")
      .whereIn("id", categoryIds)
      .whereNull("deleted_at")
      .update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
    logger.info(`Archived ${categoryIds.length} legacy categories.`);
  }
}
