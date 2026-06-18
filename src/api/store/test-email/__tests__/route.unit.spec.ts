import { POST } from "../route"

describe("POST /store/test-email", () => {
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    jest.clearAllMocks()
  })

  it("returns 404 in production before sending email", async () => {
    process.env.NODE_ENV = "production"
    const notificationModuleService = {
      createNotifications: jest.fn(),
    }
    const reqMock = {
      body: { email: "test@example.com" },
      scope: {
        resolve: jest.fn(() => notificationModuleService),
      },
    } as any
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any

    await POST(reqMock, resMock)

    expect(resMock.status).toHaveBeenCalledWith(404)
    expect(resMock.json).toHaveBeenCalledWith({ message: "Not found" })
    expect(notificationModuleService.createNotifications).not.toHaveBeenCalled()
  })
})
