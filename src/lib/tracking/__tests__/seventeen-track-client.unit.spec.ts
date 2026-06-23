import { registerSeventeenTrackShipment } from "../seventeen-track-client"

describe("17TRACK client", () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
  })

  it("registers tracking numbers with the 17token header and order tag", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          accepted: [
            {
              number: "YT1234567890123456",
              carrier: 190316,
            },
          ],
          rejected: [],
        },
      }),
    })

    const result = await registerSeventeenTrackShipment(
      {
        apiKey: "test-key",
        trackingNumber: "YT1234567890123456",
        carrierCode: 190316,
        orderId: "order_123",
      },
      fetchMock as any
    )

    expect(fetchMock).toHaveBeenCalledWith("https://api.17track.net/track/v1/register", {
      method: "POST",
      headers: {
        "17token": "test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          number: "YT1234567890123456",
          carrier: 190316,
          tag: "order_123",
        },
      ]),
    })
    expect(result).toEqual({
      number: "YT1234567890123456",
      carrier: 190316,
    })
  })

  it("throws the rejected carrier error without leaking the API key", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          accepted: [],
          rejected: [
            {
              number: "BAD",
              error: {
                message: "The format of 'BAD' is invalid.",
              },
            },
          ],
        },
      }),
    })

    await expect(
      registerSeventeenTrackShipment(
        {
          apiKey: "secret-token",
          trackingNumber: "BAD",
          orderId: "order_123",
        },
        fetchMock as any
      )
    ).rejects.toThrow("The format of 'BAD' is invalid.")
  })
})
