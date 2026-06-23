import crypto from "crypto"
import { Modules } from "@medusajs/framework/utils"
import { POST } from "../route"

describe("POST /store/tracking/17track/webhook", () => {
  const orderModule = {
    retrieveOrder: jest.fn(),
    updateOrders: jest.fn(),
  }

  const buildSignature = (event: string, data: unknown, secret: string) =>
    crypto.createHash("sha256").update(`${event}/${JSON.stringify(data)}/${secret}`, "utf8").digest("hex")

  const data = {
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
    },
  }

  const reqMock = {
    body: {
      event: "TRACKING_UPDATED",
      data,
      sign: buildSignature("TRACKING_UPDATED", data, "test-key"),
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
    orderModule.retrieveOrder.mockResolvedValue({
      id: "order_123",
      metadata: {
        geex_tracking: {
          tracking_number: "STOAA0000272952YQ",
          carrier_name: "YunExpress",
          events: [],
        },
      },
    })
  })

  afterEach(() => {
    delete process.env.SEVENTEEN_TRACK_API_KEY
    jest.clearAllMocks()
  })

  it("rejects webhook payloads with invalid signatures", async () => {
    await POST({ ...reqMock, body: { ...reqMock.body, sign: "bad" } }, resMock)

    expect(resMock.status).toHaveBeenCalledWith(401)
    expect(orderModule.updateOrders).not.toHaveBeenCalled()
  })

  it("stores 17TRACK updates on the tagged order without exposing the secret", async () => {
    await POST(reqMock, resMock)

    expect(orderModule.updateOrders).toHaveBeenCalledWith("order_123", {
      metadata: expect.objectContaining({
        geex_tracking: expect.objectContaining({
          tracking_number: "STOAA0000272952YQ",
          carrier_code: 190316,
          carrier_name: "YunExpress",
          events: [
            expect.objectContaining({
              location: "BLOOMINGTON, CA 92316",
            }),
          ],
        }),
      }),
    })
    expect(JSON.stringify(orderModule.updateOrders.mock.calls[0])).not.toContain("test-key")
    expect(resMock.json).toHaveBeenCalledWith({ received: true })
  })
})
