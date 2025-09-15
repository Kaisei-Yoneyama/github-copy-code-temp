import Handlebars from "handlebars"

// Handlebars ヘルパーの登録
Handlebars.registerHelper("trimWhitespace", function (this: unknown, options) {
  return options.fn(this).trim()
})

Handlebars.registerHelper(
  "collapseWhitespace",
  function (this: unknown, options) {
    return options.fn(this).replace(/\s+/g, " ")
  },
)

const CONTEXT = {
  isAdded: false,
  isDeleted: false,
  isModified: true,
  hunkList: [
    {
      code: "+console.log('hello');\n-console.log('world');",
      langId: "diff-js",
      filePath: "src/example.js",
      fileName: "example.js",
      newStart: 10,
      oldStart: 10,
      isFirst: true,
      isLast: false,
    },
    {
      code: "+const x = 1;\n-const y = 2;",
      langId: "diff-js",
      filePath: "src/example.js",
      fileName: "example.js",
      newStart: 20,
      oldStart: 20,
      isFirst: false,
      isLast: true,
    },
  ],
}

// メッセージハンドラー
window.addEventListener("message", (event) => {
  const { command, messageId } = event.data

  const sendMessage = (message: Record<string, unknown>) =>
    event.source!.postMessage(
      { command, messageId, message },
      { targetOrigin: event.origin },
    )

  switch (command) {
    case "render":
      try {
        const template = Handlebars.compile(event.data.templateSource)
        const result = template(event.data.context)
        sendMessage({ success: true, result })
      } catch (error) {
        sendMessage({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
      break
    case "validate":
      try {
        const template = Handlebars.compile(event.data.templateSource)
        template(CONTEXT)
        sendMessage({ success: true })
      } catch (error) {
        sendMessage({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
      break
  }
})
