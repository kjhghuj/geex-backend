import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/types"
import {
  normalizeSeventeenTrackUpdate,
  TrackingMetadata,
  verifySeventeenTrackSignature,
} from "../../../../../lib/tracking/public-tracking"

type SeventeenTrackWebhookBody = {
  event?: string
  data?: any
  sign?: string
}

function getWebhookSecret() {
  return process.env.SEVENTEEN_TRACK_WEBHOOK_SECRET || process.env.SEVENTEEN_TRACK_API_KEY || ""
}

function mergeTracking(existing: TrackingMetadata | undefined, update: TrackingMetadata): TrackingMetadata {
  return {
    ...(existing || {}),
    ...update,
    carrier_name: existing?.carrier_name || update.carrier_name || null,
    events: update.events || existing?.events || [],
  }
}

export async function POST(req: MedusaRequest<SeventeenTrackWebhookBody>, res: MedusaResponse) {
  const event = req.body?.event || ""
  const data = req.body?.data
  const signature = req.body?.sign || ""
  const secret = getWebhookSecret()

  if (!secret) {
    return res.status(500).json({
      type: "configuration_error",
      message: "17TRACK webhook secret is not configured.",
    })
  }

  if (!event || !data || !signature) {
    return res.status(400).json({
      type: "invalid_request",
      message: "Invalid 17TRACK webhook payload.",
    })
  }

  if (!verifySeventeenTrackSignature({ event, data, secret, signature })) {
    return res.status(401).json({
      type: "unauthorized",
      message: "Invalid 17TRACK webhook signature.",
    })
  }

  try {
    const updates = Array.isArray(data) ? data : [data]
    const orderModule = req.scope.resolve<IOrderModuleService>(Modules.ORDER)

    for (const item of updates) {
      const update = normalizeSeventeenTrackUpdate(item)

      if (!update.order_id) {
        continue
      }

      const order = await orderModule.retrieveOrder(update.order_id, {
        select: ["id", "metadata"],
      } as any)

      if (!order) {
        continue
      }

      const existingMetadata = (order.metadata || {}) as Record<string, unknown>
      const existingTracking = existingMetadata.geex_tracking as TrackingMetadata | undefined
      const trackingMetadata = mergeTracking(existingTracking, update)

      await orderModule.updateOrders(update.order_id, {
        metadata: {
          ...existingMetadata,
          geex_tracking: trackingMetadata,
        },
      })
    }

    return res.json({ received: true })
  } catch (error) {
    console.error("[17TRACKWebhook] Failed to process webhook:", error instanceof Error ? error.message : "Unknown error")
    return res.status(500).json({
      type: "internal_error",
      message: "Failed to process 17TRACK webhook.",
    })
  }
}
