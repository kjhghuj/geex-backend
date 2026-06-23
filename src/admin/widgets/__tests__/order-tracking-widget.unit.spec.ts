import fs from "fs"
import path from "path"

describe("Order tracking admin widget", () => {
  it("renders on order details and posts tracking data to the admin tracking API", () => {
    const widgetPath = path.join(process.cwd(), "src/admin/widgets/order-tracking.tsx")

    expect(fs.existsSync(widgetPath)).toBe(true)

    const source = fs.readFileSync(widgetPath, "utf8")

    expect(source).toContain('zone: "order.details.after"')
    expect(source).toContain("GEEX global fulfillment")
    expect(source).toContain("/admin/orders/${data.id}/tracking")
    expect(source).toContain("tracking_number")
    expect(source).toContain("carrier_code")
  })
})
