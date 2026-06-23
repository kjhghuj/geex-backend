import {
  buildPublicTracking,
  normalizeSeventeenTrackUpdate,
  verifySeventeenTrackSignature,
} from "../public-tracking"

describe("public tracking presentation", () => {
  it("uses GEEX global fulfillment copy and hides China-origin scan locations", () => {
    const tracking = buildPublicTracking({
      tracking_number: "YT1234567890123456",
      carrier_name: "YunExpress",
      events: [
        {
          occurred_at: "2026-06-22 09:00",
          location: "China, Shenzhen",
          description: "Item accepted at sorting center.",
        },
        {
          occurred_at: "2026-06-25 14:30",
          location: "Los Angeles, CA",
          description: "Arrived Shipping Partner Facility, USPS Awaiting Item",
        },
      ],
    })

    expect(tracking.headline).toBe("Your gear is on the way")
    expect(tracking.fulfillment_label).toBe("GEEX global fulfillment")
    expect(tracking.events.map((event) => event.location)).not.toContain("China, Shenzhen")
    expect(JSON.stringify(tracking)).not.toMatch(/China|Shenzhen/i)
    expect(tracking.map).toEqual(
      expect.objectContaining({
        current_public_location: "United States carrier network",
        progress_percent: 68,
        nodes: [
          { key: "fulfillment", label: "GEEX global fulfillment", status: "completed" },
          { key: "international", label: "International transit", status: "completed" },
          { key: "us_carrier", label: "United States carrier network", status: "current" },
          { key: "delivery", label: "Local delivery", status: "pending" },
        ],
      })
    )
    expect(tracking.events[0]).toEqual(
      expect.objectContaining({
        title: "Preparing through GEEX global fulfillment",
        location: "GEEX global fulfillment",
      })
    )
    expect(tracking.events[1]).toEqual(
      expect.objectContaining({
        title: "Arrived in the United States",
        location: "United States",
      })
    )
  })

  it("returns a neutral empty state when a tracking number has not been assigned", () => {
    const tracking = buildPublicTracking(null)

    expect(tracking.status).toBe("pending_tracking")
    expect(tracking.map).toEqual(
      expect.objectContaining({
        current_public_location: "GEEX global fulfillment",
        progress_percent: 8,
        nodes: [
          { key: "fulfillment", label: "GEEX global fulfillment", status: "current" },
          { key: "international", label: "International transit", status: "pending" },
          { key: "us_carrier", label: "United States carrier network", status: "pending" },
          { key: "delivery", label: "Local delivery", status: "pending" },
        ],
      })
    )
    expect(tracking.events).toEqual([
      expect.objectContaining({
        title: "Tracking will appear once your order ships",
      }),
    ])
  })

  it("normalizes 17TRACK webhook payloads into metadata events", () => {
    const update = normalizeSeventeenTrackUpdate({
      number: "STOAA0000272952YQ",
      carrier: 190316,
      tag: "order_123",
      track: {
        e: 10,
        z1: [
          {
            a: "2020-05-07 10:19",
            c: "",
            d: "BLOOMINGTON, CA 92316",
            z: "Departed Shipping Partner Facility, USPS Awaiting Item",
          },
        ],
        z9: [
          {
            a: "2020-04-13 17:07",
            c: "China, Shenzhen",
            d: "",
            z: "Item inbound in sorting center.",
          },
        ],
      },
    })

    expect(update.order_id).toBe("order_123")
    expect(update.tracking_number).toBe("STOAA0000272952YQ")
    expect(update.carrier_code).toBe(190316)
    expect(update.events).toHaveLength(2)
    expect(update.events[0]).toEqual(
      expect.objectContaining({
        location: "BLOOMINGTON, CA 92316",
      })
    )
  })

  it("maps carrier exception updates to the public exception state", () => {
    const tracking = buildPublicTracking({
      tracking_number: "YT1234567890123456",
      carrier_name: "YunExpress",
      events: [
        {
          occurred_at: "2026-06-26 09:00",
          location: "United States",
          description: "Delivery exception: address verification required.",
        },
      ],
    })

    expect(tracking.status).toBe("exception")
    expect(tracking.summary).toBe("Carrier update needed.")
    expect(tracking.map).toEqual(
      expect.objectContaining({
        mode: "exception",
        current_public_location: "Carrier update needed",
      })
    )
    expect(tracking.events[0]).toEqual(
      expect.objectContaining({
        title: "Carrier update needed",
        milestone: "exception",
      })
    )
  })
})

describe("17TRACK webhook signature verification", () => {
  it("verifies the official event/data/secret SHA256 signature shape", () => {
    const event = "TRACKING_STOPPED"
    const data = {
      number: "RM101474005CN",
      carrier: 3011,
      tag: "",
    }
    const secret = "6A8D7CFC3F7A41149E0A4EE8ABD0DD8A"

    expect(
      verifySeventeenTrackSignature({
        event,
        data,
        secret,
        signature: "a829f039332706b9b888eba84b77bd01f425ed327d2c4a92b50bba5beb0a0260",
      })
    ).toBe(true)
  })
})
