import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

const DEFAULT_STOCKED_QUANTITY = 100;

export default async function addInventoryToAllProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const inventoryService = container.resolve(Modules.INVENTORY);
  const storeService = container.resolve(Modules.STORE);

  const [store] = await storeService.listStores();
  const defaultLocationId = store?.default_location_id;

  if (!defaultLocationId) {
    throw new Error("Store has no default stock location configured.");
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "title",
      "sku",
      "manage_inventory",
      "product.title",
      "inventory_items.inventory_item_id",
    ],
    filters: {
      manage_inventory: true,
    },
  });

  const inventoryItemIds = Array.from(
    new Set(
      (variants || [])
        .flatMap((variant: any) => variant.inventory_items || [])
        .map((item: any) => item.inventory_item_id)
        .filter(Boolean)
    )
  );

  if (!inventoryItemIds.length) {
    logger.info("No product inventory items found.");
    return;
  }

  const existingLevels = await inventoryService.listInventoryLevels({
    inventory_item_id: inventoryItemIds,
    location_id: defaultLocationId,
  });

  const levelByInventoryItemId = new Map(
    existingLevels.map((level: any) => [level.inventory_item_id, level])
  );

  const levelsToCreate = inventoryItemIds
    .filter((inventoryItemId) => !levelByInventoryItemId.has(inventoryItemId))
    .map((inventoryItemId) => ({
      inventory_item_id: inventoryItemId,
      location_id: defaultLocationId,
      stocked_quantity: DEFAULT_STOCKED_QUANTITY,
    }));

  const levelsToUpdate = existingLevels
    .filter((level: any) => Number(level.stocked_quantity || 0) <= 0)
    .map((level: any) => ({
      inventory_item_id: level.inventory_item_id,
      location_id: level.location_id,
      stocked_quantity: DEFAULT_STOCKED_QUANTITY,
    }));

  if (levelsToCreate.length) {
    await inventoryService.createInventoryLevels(levelsToCreate);
  }

  if (levelsToUpdate.length) {
    await inventoryService.updateInventoryLevels(levelsToUpdate);
  }

  logger.info(
    `Inventory complete: ${levelsToCreate.length} levels created, ${levelsToUpdate.length} levels updated to ${DEFAULT_STOCKED_QUANTITY}.`
  );
}
