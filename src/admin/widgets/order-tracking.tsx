import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Text, Toaster, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type TrackingMetadata = {
  tracking_number?: string
  carrier_code?: number | string
  carrier_name?: string
}

type OrderWidgetData = {
  id: string
  metadata?: {
    geex_tracking?: TrackingMetadata
  } & Record<string, unknown>
}

const OrderTrackingWidget = ({ data }: DetailWidgetProps<OrderWidgetData>) => {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrierCode, setCarrierCode] = useState("")
  const [carrierName, setCarrierName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const existingTracking = data.metadata?.geex_tracking

    setTrackingNumber(existingTracking?.tracking_number || "")
    setCarrierCode(existingTracking?.carrier_code ? String(existingTracking.carrier_code) : "")
    setCarrierName(existingTracking?.carrier_name || "")
  }, [data])

  const handleSave = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Tracking number required", {
        description: "Enter a carrier tracking number before saving.",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/admin/orders/${data.id}/tracking`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tracking_number: trackingNumber.trim(),
          carrier_code: carrierCode.trim() ? Number(carrierCode.trim()) || carrierCode.trim() : undefined,
          carrier_name: carrierName.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message || "Failed to save tracking details.")
      }

      toast.success("Tracking saved", {
        description: "17TRACK registration is complete and customers will see GEEX global fulfillment updates.",
      })
    } catch (error) {
      toast.error("Tracking save failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Order Tracking</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Register 17TRACK details and expose them to customers as GEEX global fulfillment.
        </Text>
      </div>

      <div className="space-y-4 px-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="geex-tracking-number" weight="plus">
            Tracking number
          </Label>
          <Input
            id="geex-tracking-number"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="e.g. YT1234567890123456"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="geex-carrier-code" weight="plus">
              17TRACK carrier code
            </Label>
            <Input
              id="geex-carrier-code"
              value={carrierCode}
              onChange={(event) => setCarrierCode(event.target.value)}
              placeholder="Optional, e.g. 190316"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geex-carrier-name" weight="plus">
              Customer carrier label
            </Label>
            <Input
              id="geex-carrier-name"
              value={carrierName}
              onChange={(event) => setCarrierName(event.target.value)}
              placeholder="Optional, e.g. YunExpress"
            />
          </div>
        </div>

        <Text className="text-ui-fg-subtle" size="small">
          Customer-facing pages will use neutral GEEX global fulfillment wording and will not present a fake US origin.
        </Text>

        <Button onClick={handleSave} isLoading={isSaving} className="w-full">
          Save tracking details
        </Button>
      </div>

      <Toaster />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderTrackingWidget
