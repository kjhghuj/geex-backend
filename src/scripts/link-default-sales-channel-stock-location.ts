import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows";

export default async function linkDefaultSalesChannelStockLocation({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const storeService = container.resolve(Modules.STORE);

  const [store] = await storeService.listStores();
  const defaultLocationId = store?.default_location_id;

  if (!defaultLocationId) {
    throw new Error("Store has no default stock location configured.");
  }

  const salesChannels = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  });
  const defaultSalesChannel = salesChannels[0];

  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel was not found.");
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: defaultLocationId,
      add: [defaultSalesChannel.id],
    },
  });

  logger.info(
    `Linked ${defaultSalesChannel.name} (${defaultSalesChannel.id}) to stock location ${defaultLocationId}.`
  );
}
