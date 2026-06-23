import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/types"
import { buildPublicTracking, TrackingMetadata } from "../../../../../lib/tracking/public-tracking"
import { registerSeventeenTrackShipment } from "../../../../../lib/tracking/seventeen-track-client"

type AdminTrackingRequestBody = {
  tracking_number?: string
  carrier_code?: number | string
  carrier_name?: string
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(req: MedusaRequest<AdminTrackingRequestBody>, res: MedusaResponse) {
  const orderId = cleanText(req.params.id)
  const trackingNumber = cleanText(req.body?.tracking_number)
  const carrierName = cleanText(req.body?.carrier_name)
  const carrierCode = req.body?.carrier_code
  const apiKey = process.env.SEVENTEEN_TRACK_API_KEY

  if (!trackingNumber) {
    return res.status(400).json({
      type: "invalid_request",
      message: "tracking_number is required.",
    })
  }

  if (!apiKey) {
    return res.status(500).json({
      type: "configuration_error",
      message: "17TRACK is not configured.",
    })
  }

  try {
    const orderModule = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
    const order = await orderModule.retrieveOrder(orderId, {
      select: ["id", "metadata"],
    } as any)

    if (!order) {
      return res.status(404).json({
        type: "not_found",
        message: "Order not found.",
      })
    }

    await registerSeventeenTrackShipment({
      apiKey,
      trackingNumber,
      carrierCode,
      orderId,
    })

    const existingMetadata = (order.metadata || {}) as Record<string, unknown>
    const existingTracking = (existingMetadata.geex_tracking || {}) as TrackingMetadata
    const trackingMetadata: TrackingMetadata = {
      ...existingTracking,
      tracking_number: trackingNumber,
      carrier_code: carrierCode || existingTracking.carrier_code || null,
      carrier_name: carrierName || existingTracking.carrier_name || null,
      registered_at: existingTracking.registered_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      events: Array.isArray(existingTracking.events) ? existingTracking.events : [],
    }

    await orderModule.updateOrders(orderId, {
      metadata: {
        ...existingMetadata,
        geex_tracking: trackingMetadata,
      },
    })

    return res.json({
      success: true,
      tracking: buildPublicTracking(trackingMetadata),
    })
  } catch (error) {
    console.error("[AdminTracking] Failed to register tracking:", error instanceof Error ? error.message : "Unknown error")
    return res.status(500).json({
      type: "tracking_registration_failed",
      message: "Failed to register tracking number.",
    })
  }
}
