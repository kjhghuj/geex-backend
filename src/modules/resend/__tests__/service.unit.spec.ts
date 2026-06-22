const sendMock = jest.fn()

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}))

import ResendNotificationProviderService from "../service"

describe("ResendNotificationProviderService", () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({
      data: { id: "email_test_id" },
      error: null,
    })
    process.env.FRONTEND_URL = "https://www.geexfans.com"
  })

  it("renders the redesigned order confirmation email", async () => {
    const service = new ResendNotificationProviderService(
      { logger: console },
      { apiKey: "test-key", from: "GEEX <noreply@geexfans.com>" }
    )

    await service.send({
      to: "customer@example.com",
      channel: "email",
      template: "order_placed",
      data: {
        id: "order_test_20260620",
        display_id: "TEST-20260620",
        email: "customer@example.com",
        first_name: "Kevin",
        total: 12999,
        subtotal: 11999,
        shipping_total: 1000,
        currency_code: "USD",
        items: [
          {
            title: "GEEX Mechanical Keyboard",
            variant_title: "Black / Blue Switch",
            quantity: 1,
            unit_price: 8999,
            thumbnail: "https://www.geexfans.com/keyboard.png",
          },
        ],
        shipping_methods: [{ name: "Standard Shipping" }],
      },
    })

    const payload = sendMock.mock.calls[0][0]

    expect(payload.html).toContain("https://www.geexfans.com/brand/geex-logo-lockup.png")
    expect(payload.html).toContain("Your setup gear is confirmed.")
    expect(payload.html).toContain("font-family:'Arial Black','Microsoft YaHei UI','Microsoft YaHei',SimHei,Arial,sans-serif")
    expect(payload.html).toContain("Order confirmed")
    expect(payload.html).toContain("Next update")
    expect(payload.html).toContain("padding:14px 20px")
    expect(payload.html).toContain("Standard Shipping")
    expect(payload.html).toContain("USD 129.99")
    expect(payload.html).not.toContain("Your GEEX order is confirmed.")
  })
})
