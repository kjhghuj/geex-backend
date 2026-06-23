import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildPublicTracking, TrackingMetadata } from "../../../../../lib/tracking/public-tracking"

type LookupOrderRequestBody = {
  email?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeOrderId(orderId: string) {
  return orderId.startsWith("order_") ? orderId : `order_${orderId}`
}

function deriveFulfillmentStatus(order: any) {
  const fulfillments = Array.isArray(order.fulfillments) ? order.fulfillments : []

  if (!fulfillments.length) {
    return order.fulfillment_status || "not_fulfilled"
  }

  const activeFulfillments = fulfillments.filter((fulfillment: any) => !fulfillment.canceled_at)
  const partiallyFulfilled = Array.isArray(order.items)
    ? order.items.some((item: any) => {
        const fulfilledQuantity = item.detail?.raw_fulfilled_quantity
        const orderedQuantity = item.raw_quantity ?? item.quantity

        return fulfilledQuantity !== undefined && orderedQuantity !== undefined && Number(fulfilledQuantity) < Number(orderedQuantity)
      })
    : false

  if (!activeFulfillments.length) return "canceled"
  if (activeFulfillments.every((fulfillment: any) => fulfillment.delivered_at)) {
    return partiallyFulfilled ? "partially_delivered" : "delivered"
  }
  if (activeFulfillments.some((fulfillment: any) => fulfillment.delivered_at)) return "partially_delivered"
  if (activeFulfillments.every((fulfillment: any) => fulfillment.shipped_at)) {
    return partiallyFulfilled ? "partially_shipped" : "shipped"
  }
  if (activeFulfillments.some((fulfillment: any) => fulfillment.shipped_at)) return "partially_shipped"
  if (activeFulfillments.every((fulfillment: any) => fulfillment.packed_at)) {
    return partiallyFulfilled ? "partially_fulfilled" : "fulfilled"
  }
  if (activeFulfillments.some((fulfillment: any) => fulfillment.packed_at)) return "partially_fulfilled"

  return order.fulfillment_status || "not_fulfilled"
}

function derivePaymentStatus(order: any) {
  const paymentCollections = Array.isArray(order.payment_collections) ? order.payment_collections : []

  if (!paymentCollections.length) {
    return order.payment_status || "not_paid"
  }

  const activeCollections = paymentCollections.filter((collection: any) => collection.status !== "canceled")
  const capturedCollections = activeCollections.filter((collection: any) => {
    const amount = Number(collection.amount || 0)
    const capturedAmount = Number(collection.captured_amount || 0)

    return capturedAmount > 0 || amount === 0
  })
  const fullyCapturedCollections = capturedCollections.filter((collection: any) => {
    const amount = Number(collection.amount || 0)
    const capturedAmount = Number(collection.captured_amount || 0)

    return capturedAmount >= amount
  })
  const refundedCollections = activeCollections.filter((collection: any) => Number(collection.refunded_amount || 0) > 0)
  const fullyRefundedCollections = refundedCollections.filter((collection: any) => {
    const amount = Number(collection.amount || 0)
    const refundedAmount = Number(collection.refunded_amount || 0)

    return refundedAmount >= amount
  })

  if (paymentCollections.some((collection: any) => collection.status === "requires_action")) return "requires_action"

  if (refundedCollections.length > 0) {
    return fullyRefundedCollections.length === capturedCollections.length ? "refunded" : "partially_refunded"
  }

  if (capturedCollections.length > 0) {
    return fullyCapturedCollections.length === activeCollections.length ? "captured" : "partially_captured"
  }

  const authorizedCollections = activeCollections.filter((collection: any) => collection.status === "authorized")
  if (authorizedCollections.length > 0) {
    return authorizedCollections.length === activeCollections.length ? "authorized" : "partially_authorized"
  }

  if (!activeCollections.length) return "canceled"
  if (activeCollections.some((collection: any) => collection.status === "awaiting")) return "awaiting"

  return "not_paid"
}

function sanitizeOrder(order: any) {
  return {
    id: order.id,
    display_id: order.display_id,
    status: order.status,
    fulfillment_status: deriveFulfillmentStatus(order),
    payment_status: derivePaymentStatus(order),
    created_at: order.created_at,
    total: order.total,
    currency_code: order.currency_code,
    region_id: order.region_id,
    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          thumbnail: item.thumbnail,
          variant_id: item.variant_id,
          product_id: item.product_id,
        }))
      : [],
  }
}

export async function POST(req: MedusaRequest<LookupOrderRequestBody>, res: MedusaResponse) {
  const email = req.body?.email?.trim().toLowerCase()
  const orderId = normalizeOrderId(String(req.params.id || "").trim())

  if (!EMAIL_REGEX.test(email || "")) {
    return res.status(400).json({
      type: "invalid_request",
      message: "A valid email address is required.",
    })
  }

  if (!orderId || orderId === "order_") {
    return res.status(400).json({
      type: "invalid_request",
      message: "Order ID is required.",
    })
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "status",
        "fulfillment_status",
        "payment_status",
        "created_at",
        "total",
        "currency_code",
        "region_id",
        "metadata",
        "fulfillments.*",
        "payment_collections.*",
        "items.*",
        "items.detail.*",
        "items.variant_id",
        "items.product_id",
        "items.thumbnail",
      ],
      filters: {
        id: orderId,
      },
    })

    const order = orders?.[0]
    const orderEmail = order?.email?.trim().toLowerCase()

    if (!order || !orderEmail || orderEmail !== email) {
      return res.status(404).json({
        type: "not_found",
        message: "Order not found with provided details.",
      })
    }

    const trackingMetadata = order.metadata?.geex_tracking as TrackingMetadata | undefined

    return res.json({
      order: sanitizeOrder(order),
      tracking: buildPublicTracking(trackingMetadata),
    })
  } catch (error) {
    console.error("[OrderLookup] Failed to retrieve order:", error instanceof Error ? error.message : "Unknown error")
    return res.status(500).json({
      type: "internal_error",
      message: "Could not retrieve order details.",
    })
  }
}
