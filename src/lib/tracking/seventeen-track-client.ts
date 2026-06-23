type FetchLike = typeof fetch

type RegisterShipmentOptions = {
  apiKey: string
  trackingNumber: string
  carrierCode?: number | string | null
  orderId: string
}

type SeventeenTrackAccepted = {
  number: string
  carrier?: number | string
}

const REGISTER_ENDPOINT = "https://api.17track.net/track/v1/register"

function rejectedMessage(rejected: any) {
  return rejected?.error?.message || rejected?.message || "17TRACK rejected the tracking number."
}

export async function registerSeventeenTrackShipment(
  options: RegisterShipmentOptions,
  fetchFn: FetchLike = fetch
): Promise<SeventeenTrackAccepted> {
  if (!options.apiKey) {
    throw new Error("17TRACK API key is not configured.")
  }

  if (!options.trackingNumber) {
    throw new Error("Tracking number is required.")
  }

  const body: Record<string, unknown> = {
    number: options.trackingNumber,
  }

  if (options.carrierCode) {
    body.carrier = options.carrierCode
  }

  body.tag = options.orderId

  const response = await fetchFn(REGISTER_ENDPOINT, {
    method: "POST",
    headers: {
      "17token": options.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([body]),
  })

  if (!response.ok) {
    throw new Error(`17TRACK registration failed with HTTP ${response.status}.`)
  }

  const payload = await response.json()

  if (payload?.data?.rejected?.length) {
    throw new Error(rejectedMessage(payload.data.rejected[0]))
  }

  const accepted = payload?.data?.accepted?.[0]

  if (!accepted) {
    throw new Error(payload?.message || "17TRACK did not accept the tracking number.")
  }

  return accepted
}
