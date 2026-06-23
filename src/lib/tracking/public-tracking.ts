import crypto from "crypto"

export type TrackingMetadataEvent = {
  occurred_at?: string | null
  location?: string | null
  description?: string | null
}

export type TrackingMetadata = {
  tracking_number?: string | null
  carrier_code?: number | string | null
  carrier_name?: string | null
  status_code?: number | null
  registered_at?: string | null
  updated_at?: string | null
  events?: TrackingMetadataEvent[]
}

export type PublicTrackingEvent = {
  id: string
  occurred_at: string | null
  title: string
  description: string
  location: string
  milestone:
    | "processing"
    | "international_transit"
    | "arrived_us"
    | "local_carrier"
    | "out_for_delivery"
    | "delivered"
    | "exception"
}

export type PublicTrackingMapNode = {
  key: "fulfillment" | "international" | "us_carrier" | "delivery"
  label: string
  status: "completed" | "current" | "pending"
}

export type PublicTracking = {
  status:
    | "pending_tracking"
    | "processing"
    | "in_transit"
    | "arrived_us"
    | "out_for_delivery"
    | "delivered"
    | "exception"
  headline: string
  fulfillment_label: "GEEX global fulfillment"
  summary: string
  tracking_number: string | null
  carrier_name: string | null
  map: {
    label: "Estimated route"
    mode: "pending" | "international" | "united_states" | "delivered" | "exception"
    destination_country: "United States"
    current_public_location: string
    progress_percent: number
    nodes: PublicTrackingMapNode[]
  }
  events: PublicTrackingEvent[]
}

export type NormalizedSeventeenTrackUpdate = TrackingMetadata & {
  order_id: string | null
  tracking_number: string
}

const FULFILLMENT_LABEL = "GEEX global fulfillment"
const CHINA_LOCATION_PATTERN = /\b(china|cn|shenzhen|guangzhou|guangdong|hong kong|hongkong|yiwu|dongguan)\b/i
const UNITED_STATES_PATTERN =
  /\b(united states|usa|u\.s\.|usps|fedex|ups|dhl ecommerce|ca\s*\d{5}|ny\s*\d{5}|tx\s*\d{5}|fl\s*\d{5}|il\s*\d{5})\b/i
const PUBLIC_ROUTE_NODE_LABELS: Record<PublicTrackingMapNode["key"], string> = {
  fulfillment: FULFILLMENT_LABEL,
  international: "International transit",
  us_carrier: "United States carrier network",
  delivery: "Local delivery",
}
const PUBLIC_ROUTE_NODE_KEYS: PublicTrackingMapNode["key"][] = [
  "fulfillment",
  "international",
  "us_carrier",
  "delivery",
]

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isChinaOriginEvent(event: TrackingMetadataEvent) {
  return CHINA_LOCATION_PATTERN.test(`${event.location || ""} ${event.description || ""}`)
}

function isUnitedStatesEvent(event: TrackingMetadataEvent) {
  return UNITED_STATES_PATTERN.test(`${event.location || ""} ${event.description || ""}`)
}

function classifyEvent(event: TrackingMetadataEvent): Omit<PublicTrackingEvent, "id" | "occurred_at"> {
  const text = `${event.location || ""} ${event.description || ""}`

  if (/exception|failed|failure|undeliverable|return(ed)? to sender|held|address verification|required|unable to deliver/i.test(text)) {
    return {
      title: "Carrier update needed",
      description: "The carrier needs attention before the package can keep moving.",
      location: "Carrier update needed",
      milestone: "exception",
    }
  }

  if (/delivered/i.test(text)) {
    return {
      title: "Delivered",
      description: "Your package has been delivered by the local carrier.",
      location: "United States",
      milestone: "delivered",
    }
  }

  if (/out for delivery/i.test(text)) {
    return {
      title: "Out for delivery",
      description: "Your package is with the local carrier for final delivery.",
      location: "United States",
      milestone: "out_for_delivery",
    }
  }

  if (/customs|clearance/i.test(text)) {
    return {
      title: "Handed to local carrier",
      description: "Your package is moving through destination-country processing.",
      location: "United States",
      milestone: "local_carrier",
    }
  }

  if (isUnitedStatesEvent(event)) {
    return {
      title: "Arrived in the United States",
      description: "Carrier scan updates show the package has reached the United States delivery network.",
      location: "United States",
      milestone: "arrived_us",
    }
  }

  if (isChinaOriginEvent(event)) {
    return {
      title: "Preparing through GEEX global fulfillment",
      description: "Your order is being prepared and moved into the international carrier network.",
      location: FULFILLMENT_LABEL,
      milestone: "processing",
    }
  }

  if (/transit|departed|airline|flight|export|shipping partner/i.test(text)) {
    return {
      title: "International transit started",
      description: "Your package is moving through international transit toward the United States.",
      location: "International transit",
      milestone: "international_transit",
    }
  }

  return {
    title: "Preparing through GEEX global fulfillment",
    description: "Your order is moving through GEEX global fulfillment.",
    location: FULFILLMENT_LABEL,
    milestone: "processing",
  }
}

function statusFromEvents(events: PublicTrackingEvent[]): PublicTracking["status"] {
  if (events.some((event) => event.milestone === "delivered")) return "delivered"
  if (events.some((event) => event.milestone === "out_for_delivery")) return "out_for_delivery"
  if (events.some((event) => event.milestone === "exception")) return "exception"
  if (events.some((event) => event.milestone === "arrived_us" || event.milestone === "local_carrier")) return "arrived_us"
  if (events.some((event) => event.milestone === "international_transit")) return "in_transit"
  return "processing"
}

function mapModeFromStatus(status: PublicTracking["status"]): PublicTracking["map"]["mode"] {
  if (status === "delivered") return "delivered"
  if (status === "exception") return "exception"
  if (status === "arrived_us" || status === "out_for_delivery") return "united_states"
  if (status === "pending_tracking") return "pending"
  return "international"
}

function currentRouteNodeFromStatus(status: PublicTracking["status"]): PublicTrackingMapNode["key"] {
  if (status === "delivered" || status === "out_for_delivery") return "delivery"
  if (status === "arrived_us" || status === "exception") return "us_carrier"
  if (status === "in_transit") return "international"
  return "fulfillment"
}

function progressPercentFromStatus(status: PublicTracking["status"]) {
  switch (status) {
    case "pending_tracking":
      return 8
    case "processing":
      return 18
    case "in_transit":
      return 45
    case "arrived_us":
      return 68
    case "out_for_delivery":
      return 86
    case "delivered":
      return 100
    case "exception":
      return 55
    default:
      return 18
  }
}

function currentPublicLocationFromStatus(status: PublicTracking["status"]) {
  switch (status) {
    case "in_transit":
      return PUBLIC_ROUTE_NODE_LABELS.international
    case "arrived_us":
      return PUBLIC_ROUTE_NODE_LABELS.us_carrier
    case "out_for_delivery":
      return "Local delivery network"
    case "delivered":
      return "Delivered"
    case "exception":
      return "Carrier update needed"
    default:
      return FULFILLMENT_LABEL
  }
}

function publicRouteNodesFromStatus(status: PublicTracking["status"]): PublicTrackingMapNode[] {
  const currentNode = currentRouteNodeFromStatus(status)
  const currentIndex = PUBLIC_ROUTE_NODE_KEYS.indexOf(currentNode)

  return PUBLIC_ROUTE_NODE_KEYS.map((key, index) => ({
    key,
    label: PUBLIC_ROUTE_NODE_LABELS[key],
    status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending",
  }))
}

function publicMapFromStatus(status: PublicTracking["status"]): PublicTracking["map"] {
  return {
    label: "Estimated route",
    mode: mapModeFromStatus(status),
    destination_country: "United States",
    current_public_location: currentPublicLocationFromStatus(status),
    progress_percent: progressPercentFromStatus(status),
    nodes: publicRouteNodesFromStatus(status),
  }
}

function publicSummaryFromStatus(status: PublicTracking["status"]) {
  switch (status) {
    case "exception":
      return "Carrier update needed."
    case "delivered":
      return "Delivered by the local carrier."
    case "out_for_delivery":
      return "Your package is out for delivery."
    case "arrived_us":
      return "Your package has reached the United States delivery network."
    case "in_transit":
      return "In transit to the United States."
    case "pending_tracking":
      return "Tracking will appear once your order ships."
    default:
      return "Your order is moving through GEEX global fulfillment."
  }
}

export function buildPublicTracking(metadata?: TrackingMetadata | null): PublicTracking {
  if (!metadata?.tracking_number) {
    return {
      status: "pending_tracking",
      headline: "Tracking will appear once your order ships",
      fulfillment_label: FULFILLMENT_LABEL,
      summary: "Tracking will appear once your order ships.",
      tracking_number: null,
      carrier_name: null,
      map: publicMapFromStatus("pending_tracking"),
      events: [
        {
          id: "pending-tracking",
          occurred_at: null,
          title: "Tracking will appear once your order ships",
          description: "We will update this page as soon as the carrier assigns tracking.",
          location: FULFILLMENT_LABEL,
          milestone: "processing",
        },
      ],
    }
  }

  const sourceEvents = Array.isArray(metadata.events) ? metadata.events : []
  const publicEvents = sourceEvents.map((event, index) => ({
    id: `${metadata.tracking_number}-${index}`,
    occurred_at: hasText(event.occurred_at) ? event.occurred_at : null,
    ...classifyEvent(event),
  }))

  if (publicEvents.length === 0) {
    publicEvents.push({
      id: `${metadata.tracking_number}-registered`,
      occurred_at: metadata.registered_at || null,
      title: "Preparing through GEEX global fulfillment",
      description: "Your tracking number has been registered and carrier updates are syncing.",
      location: FULFILLMENT_LABEL,
      milestone: "processing",
    })
  }

  const status = statusFromEvents(publicEvents)

  return {
    status,
    headline: "Your gear is on the way",
    fulfillment_label: FULFILLMENT_LABEL,
    summary: publicSummaryFromStatus(status),
    tracking_number: metadata.tracking_number,
    carrier_name: hasText(metadata.carrier_name) ? metadata.carrier_name : null,
    map: publicMapFromStatus(status),
    events: publicEvents,
  }
}

export function normalizeSeventeenTrackUpdate(data: any): NormalizedSeventeenTrackUpdate {
  const track = data?.track || {}
  const carrierCode = data?.carrier || track?.w1 || null
  const eventSets = [track.z1, track.z2, track.z9].filter(Array.isArray) as any[][]
  const events = eventSets.flat().map((event) => ({
    occurred_at: hasText(event?.a) ? event.a : null,
    location: [event?.c, event?.d].filter(hasText).join(" ").trim(),
    description: hasText(event?.z) ? event.z : "",
  }))

  return {
    order_id: hasText(data?.tag) && data.tag.startsWith("order_") ? data.tag : null,
    tracking_number: String(data?.number || ""),
    carrier_code: carrierCode,
    status_code: typeof track?.e === "number" ? track.e : null,
    updated_at: new Date().toISOString(),
    events,
  }
}

export function verifySeventeenTrackSignature({
  event,
  data,
  secret,
  signature,
}: {
  event: string
  data: unknown
  secret: string
  signature: string
}) {
  const expected = crypto
    .createHash("sha256")
    .update(`${event}/${JSON.stringify(data)}/${secret}`, "utf8")
    .digest("hex")

  const expectedBuffer = Buffer.from(expected, "hex")
  const signatureBuffer = Buffer.from(signature, "hex")

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  )
}
