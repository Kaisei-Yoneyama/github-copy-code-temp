/**
 * テスト用のモック Template Renderer
 * Handlebars を直接使用してテンプレートをレンダリングする
 */

import type { TemplateRenderer } from "@/utils/templateRenderer"
import Handlebars from "handlebars"

// Handlebars ヘルパーを登録
Handlebars.registerHelper("trimWhitespace", function (this: unknown, options) {
  return options.fn(this).trim()
})

Handlebars.registerHelper(
  "collapseWhitespace",
  function (this: unknown, options) {
    return options.fn(this).replace(/\s+/g, " ")
  },
)

export const createMockTemplateRenderer = (): TemplateRenderer => ({
  async render(
    templateSource: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    const template = Handlebars.compile(templateSource)
    return template(context)
  },

  async validate(templateSource: string): Promise<void> {
    try {
      Handlebars.compile(templateSource)
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Invalid Handlebars syntax",
      )
    }
  },
})
