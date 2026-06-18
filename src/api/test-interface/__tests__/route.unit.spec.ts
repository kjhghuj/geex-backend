import { GET } from "../route"

describe("GET /test-interface", () => {
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    jest.clearAllMocks()
  })

  it("returns 404 in production", async () => {
    process.env.NODE_ENV = "production"
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as any

    await GET({} as any, resMock)

    expect(resMock.status).toHaveBeenCalledWith(404)
    expect(resMock.json).toHaveBeenCalledWith({ message: "Not found" })
    expect(resMock.send).not.toHaveBeenCalled()
  })
})
