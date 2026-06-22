import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  PRODUCT_STORIES,
  buildProductStoryMetadata,
} from "./product-stories"

type ProductRecord = {
  id: string
  handle: string
  metadata?: Record<string, unknown> | null
}

export default async function updateProductStories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const storyHandles = Object.keys(PRODUCT_STORIES)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    filters: {
      handle: storyHandles,
    },
  })

  const productsByHandle = new Map(
    ((products || []) as ProductRecord[]).map((product) => [product.handle, product])
  )
  const missingHandles = storyHandles.filter((handle) => !productsByHandle.has(handle))

  if (missingHandles.length) {
    logger.warn(`Missing products for story update: ${missingHandles.join(", ")}`)
  }

  let updatedCount = 0

  for (const handle of storyHandles) {
    const product = productsByHandle.get(handle)

    if (!product) {
      continue
    }

    await productModuleService.updateProducts(product.id, {
      metadata: buildProductStoryMetadata(product.handle, product.metadata),
    })

    updatedCount += 1
  }

  logger.info(`Updated product stories for ${updatedCount} GEEX products.`)
}
