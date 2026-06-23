import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { POST } from "../route"

describe("POST /store/orders/:id/lookup", () => {
  const queryMock = {
    graph: jest.fn(),
  }

  const reqMock = {
    params: {
      id: "order_123",
    },
    body: {
      email: "customer@example.com",
    },
    scope: {
      resolve: jest.fn((key) => {
        if (key === ContainerRegistrationKeys.QUERY) {
          return queryMock
        }
        return {}
      }),
    },
  } as any

  const resMock = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("requires a valid email before looking up an order", async () => {
    await POST({ ...reqMock, body: { email: "not-an-email" } }, resMock)

    expect(resMock.status).toHaveBeenCalledWith(400)
    expect(queryMock.graph).not.toHaveBeenCalled()
  })

  it("uses a fake not-found response when the email does not match", async () => {
    queryMock.graph.mockResolvedValue({
      data: [
        {
          id: "order_123",
          email: "real@example.com",
          metadata: {},
          items: [],
        },
      ],
    })

    await POST(reqMock, resMock)

    expect(resMock.status).toHaveBeenCalledWith(404)
    expect(resMock.json).toHaveBeenCalledWith({
      type: "not_found",
      message: "Order not found with provided details.",
    })
  })

  it("returns a sanitized order and public tracking data for a matching email", async () => {
    queryMock.graph.mockResolvedValue({
      data: [
        {
          id: "order_123",
          display_id: 101,
          email: "customer@example.com",
          status: "pending",
          fulfillments: [
            {
              id: "ful_123",
              packed_at: "2026-06-22T10:05:00.000Z",
              shipped_at: "2026-06-22T10:10:00.000Z",
              delivered_at: null,
              canceled_at: null,
            },
          ],
          payment_collections: [
            {
              status: "captured",
              amount: 1299,
              captured_amount: 1299,
              refunded_amount: 0,
            },
          ],
          created_at: "2026-06-22T10:00:00.000Z",
          total: 1299,
          currency_code: "usd",
          region_id: "reg_123",
          metadata: {
            geex_tracking: {
              tracking_number: "YT1234567890123456",
              carrier_name: "YunExpress",
              raw_payload: {
                internal: "not for client",
              },
              events: [
                {
                  occurred_at: "2026-06-22 09:00",
                  location: "China, Shenzhen",
                  description: "Item accepted.",
                },
              ],
            },
          },
          items: [
            {
              id: "item_123",
              title: "Keyboard",
              quantity: 1,
              unit_price: 1299,
              thumbnail: "https://example.com/keyboard.jpg",
              variant_id: "variant_123",
              product_id: "prod_123",
            },
          ],
        },
      ],
    })

    await POST(reqMock, resMock)

    expect(resMock.json).toHaveBeenCalledWith({
      order: expect.objectContaining({
        status: "pending",
        fulfillment_status: "shipped",
        payment_status: "captured",
      }),
      tracking: expect.objectContaining({
        fulfillment_label: "GEEX global fulfillment",
      }),
    })
    expect(resMock.json.mock.calls[0][0].order).toEqual(
      expect.not.objectContaining({
        email: expect.anything(),
        metadata: expect.anything(),
      })
    )
    expect(JSON.stringify(resMock.json.mock.calls[0][0])).not.toContain("China")
    expect(JSON.stringify(resMock.json.mock.calls[0][0])).not.toContain("raw_payload")
  })

  it("derives edge payment statuses from Medusa payment collections", async () => {
    queryMock.graph.mockResolvedValueOnce({
      data: [
        {
          id: "order_123",
          display_id: 101,
          email: "customer@example.com",
          status: "pending",
          fulfillments: [],
          payment_collections: [
            {
              status: "captured",
              amount: 1299,
              captured_amount: 1299,
              refunded_amount: 1299,
            },
          ],
          created_at: "2026-06-22T10:00:00.000Z",
          total: 1299,
          currency_code: "usd",
          metadata: {},
          items: [],
        },
      ],
    })

    await POST(reqMock, resMock)

    expect(resMock.json.mock.calls[0][0].order.payment_status).toBe("refunded")

    jest.clearAllMocks()

    queryMock.graph.mockResolvedValueOnce({
      data: [
        {
          id: "order_123",
          display_id: 101,
          email: "customer@example.com",
          status: "pending",
          fulfillments: [],
          payment_collections: [
            {
              status: "authorized",
              amount: 1299,
              captured_amount: 0,
              refunded_amount: 0,
            },
            {
              status: "awaiting",
              amount: 1299,
              captured_amount: 0,
              refunded_amount: 0,
            },
          ],
          created_at: "2026-06-22T10:00:00.000Z",
          total: 2598,
          currency_code: "usd",
          metadata: {},
          items: [],
        },
      ],
    })

    await POST(reqMock, resMock)

    expect(resMock.json.mock.calls[0][0].order.payment_status).toBe("partially_authorized")
  })
})
