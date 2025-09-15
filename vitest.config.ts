import { defineConfig } from "vitest/config"
import { WxtVitest } from "wxt/testing"

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    setupFiles: ["./tests/setup.ts"],
    include: ["./tests/unit/**/*.test.ts"],
  },
})
