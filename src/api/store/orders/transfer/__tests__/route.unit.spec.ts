import { Modules } from "@medusajs/framework/utils"
import { POST } from "../route"

describe("POST /store/orders/transfer", () => {
  const orderModule = {
    retrieveOrder: jest.fn(),
    updateOrders: jest.fn(),
  }
  const customerModule = {
    retrieveCustomer: jest.fn(),
    createCustomerAddresses: jest.fn(),
  }

  const buildReq = (overrides: Record<string, any> = {}) =>
    ({
      body: {
        order_id: "order_123",
        customer_id: "attacker_customer",
        customer_email: "attacker@example.com",
      },
      auth_context: {
        actor_id: "authenticated_customer",
        actor_type: "customer",
      },
      scope: {
        resolve: jest.fn((key) => {
          if (key === Modules.ORDER) return orderModule
          if (key === Modules.CUSTOMER) return customerModule
          return {}
        }),
      },
      ...overrides,
    }) as any

  const resMock = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("requires an authenticated customer", async () => {
    await POST(buildReq({ auth_context: undefined }), resMock)

    expect(resMock.status).toHaveBeenCalledWith(401)
    expect(orderModule.updateOrders).not.toHaveBeenCalled()
  })

  it("transfers to authenticated customer, ignoring customer_id from body", async () => {
    orderModule.retrieveOrder.mockResolvedValue({
      id: "order_123",
      email: "real@example.com",
      shipping_address: null,
      billing_address: null,
    })
    customerModule.retrieveCustomer.mockResolvedValue({
      id: "authenticated_customer",
      email: "real@example.com",
    })

    await POST(buildReq(), resMock)

    expect(customerModule.retrieveCustomer).toHaveBeenCalledWith("authenticated_customer")
    expect(orderModule.updateOrders).toHaveBeenCalledWith("order_123", {
      customer_id: "authenticated_customer",
    })
    expect(resMock.status).toHaveBeenCalledWith(200)
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        customer_id: "authenticated_customer",
      })
    )
  })
})
