import { readFileSync } from "node:fs"

describe("product story script wiring", () => {
  it("adds story metadata when creating GEEX products", () => {
    const addProductsScript = readFileSync("src/scripts/add-geex-products.ts", "utf8")
    const seedScript = readFileSync("src/scripts/seed.ts", "utf8")

    for (const source of [addProductsScript, seedScript]) {
      expect(source).toContain('from "./product-stories"')
      expect(source).toContain("metadata: buildProductStoryMetadata(product.handle)")
    }
  })

  it("provides a script that updates stories on existing products", () => {
    const updateScript = readFileSync("src/scripts/update-product-stories.ts", "utf8")

    expect(updateScript).toContain('from "./product-stories"')
    expect(updateScript).toContain("buildProductStoryMetadata(product.handle, product.metadata")
    expect(updateScript).toContain("productModuleService.updateProducts")
  })
})
