import { Modules } from "@medusajs/framework/utils"
import { POST } from "../route"
import { registerSeventeenTrackShipment } from "../../../../../../lib/tracking/seventeen-track-client"

jest.mock("../../../../../../lib/tracking/seventeen-track-client", () => ({
  registerSeventeenTrackShipment: jest.fn(),
}))

describe("POST /admin/orders/:id/tracking", () => {
  const orderModule = {
    retrieveOrder: jest.fn(),
    updateOrders: jest.fn(),
  }

  const reqMock = {
    params: {
      id: "order_123",
    },
    body: {
      tracking_number: "YT1234567890123456",
      carrier_code: 190316,
      carrier_name: "YunExpress",
    },
    scope: {
      resolve: jest.fn((key) => {
        if (key === Modules.ORDER) return orderModule
        return {}
      }),
    },
  } as any

  const resMock = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any

  beforeEach(() => {
    process.env.SEVENTEEN_TRACK_API_KEY = "test-key"
    ;(registerSeventeenTrackShipment as jest.Mock).mockResolvedValue({
      number: "YT1234567890123456",
      carrier: 190316,
    })
    orderModule.retrieveOrder.mockResolvedValue({
      id: "order_123",
      metadata: {
        existing: true,
      },
    })
  })

  afterEach(() => {
    delete process.env.SEVENTEEN_TRACK_API_KEY
    jest.clearAllMocks()
  })

  it("requires a tracking number", async () => {
    await POST({ ...reqMock, body: { carrier_code: 190316 } }, resMock)

    expect(resMock.status).toHaveBeenCalledWith(400)
    expect(registerSeventeenTrackShipment).not.toHaveBeenCalled()
  })

  it("registers 17TRACK and stores sanitized tracking metadata on the order", async () => {
    await POST(reqMock, resMock)

    expect(registerSeventeenTrackShipment).toHaveBeenCalledWith({
      apiKey: "test-key",
      trackingNumber: "YT1234567890123456",
      carrierCode: 190316,
      orderId: "order_123",
    })
    expect(orderModule.updateOrders).toHaveBeenCalledWith("order_123", {
      metadata: expect.objectContaining({
        existing: true,
        geex_tracking: expect.objectContaining({
          tracking_number: "YT1234567890123456",
          carrier_code: 190316,
          carrier_name: "YunExpress",
          events: [],
        }),
      }),
    })
    expect(JSON.stringify(orderModule.updateOrders.mock.calls[0])).not.toContain("test-key")
    expect(resMock.json).toHaveBeenCalledWith({
      success: true,
      tracking: expect.objectContaining({
        tracking_number: "YT1234567890123456",
      }),
    })
  })
})
