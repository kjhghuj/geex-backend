import { PRODUCT_STORIES, getProductStorySections } from "../product-stories"

const GEEX_PRODUCT_HANDLES = [
  "geex-a75-mechanical-keyboard",
  "geex-m2-pro-wireless-mouse",
  "geex-pods-x1",
  "geex-desk-mat-pro-xl",
  "geex-100w-usb-c-cable",
  "geex-adjustable-tablet-stand",
  "geex-orbit-dock-7-in-1",
  "geex-control-pad",
]

describe("product story content", () => {
  it("covers every seeded GEEX product", () => {
    expect(Object.keys(PRODUCT_STORIES).sort()).toEqual(GEEX_PRODUCT_HANDLES.sort())
  })

  it("provides two complete story sections per product", () => {
    for (const handle of GEEX_PRODUCT_HANDLES) {
      const sections = getProductStorySections(handle)

      expect(sections).toHaveLength(2)

      for (const section of sections) {
        expect(section.id).toMatch(new RegExp(`^${handle}-story-[12]$`))
        expect(section.title.trim().length).toBeGreaterThan(8)
        expect(section.content.trim().length).toBeGreaterThan(180)
        expect(section.imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\//)
        expect(section.imageAlt.trim().length).toBeGreaterThan(12)
      }
    }
  })

  it("returns an empty story list for unknown products", () => {
    expect(getProductStorySections("unknown-product")).toEqual([])
  })
})
