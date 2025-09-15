/**
 * テンプレートレンダラーのインターフェース
 */
export interface TemplateRenderer {
  /**
   * テンプレートをレンダリングする
   * @param templateSource テンプレートのソース
   * @param context レンダリング用のコンテキスト
   * @returns レンダリング結果
   */
  render(
    templateSource: string,
    context: Record<string, unknown>,
  ): Promise<string>

  /**
   * テンプレートの構文を検証する
   * @param templateSource テンプレートのソース
   */
  validate(templateSource: string): Promise<void>
}

export const createTemplateRenderer = (): TemplateRenderer => {
  let sandbox: HTMLIFrameElement | null = null

  const ensureSandboxContentWindow = (): Promise<Window> => {
    if (sandbox) {
      return Promise.resolve(sandbox.contentWindow!)
    }

    sandbox = document.createElement("iframe")
    sandbox.src = browser.runtime.getURL("/template-renderer.html")
    sandbox.style.display = "none"
    document.body.appendChild(sandbox)

    return Promise.resolve(sandbox.contentWindow!)
  }

  const sendMessage = (
    command: string,
    message: Record<string, unknown>,
    targetWindow: Window = window,
    targetOrigin: string = "*",
  ): Promise<
    | {
        success: true
        result: string
      }
    | {
        success: false
        error: string
      }
  > =>
    new Promise((resolve, reject) => {
      const messageId = crypto.randomUUID()
      const timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error(`Request timed out`))
      }, 50) // リトライを考慮して短めに設定
      const handleMessage = (event: MessageEvent) => {
        if (event.data.messageId === messageId) {
          cleanup()
          resolve(event.data.message)
        }
      }
      const cleanup = () => {
        window.removeEventListener("message", handleMessage)
        clearTimeout(timeoutId)
      }
      window.addEventListener("message", handleMessage)
      targetWindow.postMessage({ command, messageId, ...message }, targetOrigin)
    })

  return {
    async render(
      templateSource: string,
      context: Record<string, unknown>,
    ): Promise<string> {
      const response = await retry(async () =>
        sendMessage(
          "render",
          {
            templateSource,
            context,
          },
          await ensureSandboxContentWindow(),
        ),
      )

      if (!response.success) {
        throw new Error(response.error)
      }

      return response.result
    },

    async validate(templateSource: string): Promise<void> {
      const response = await retry(async () =>
        sendMessage(
          "validate",
          {
            templateSource,
          },
          await ensureSandboxContentWindow(),
        ),
      )

      if (!response.success) {
        throw new Error(response.error)
      }
    },
  }
}

let globalRenderer: TemplateRenderer | null = null

export const getTemplateRenderer = (): TemplateRenderer => {
  if (!globalRenderer) {
    globalRenderer = createTemplateRenderer()
  }

  return globalRenderer
}
