import {
  Checkbox,
  Dialog,
  FormControl,
  Textarea,
  TextInput,
} from "@primer/react"
import { Banner } from "@primer/react/experimental"
import { FormEvent, useEffect, useState } from "react"
import { getTemplateRenderer } from "@/utils/templateRenderer"

interface TemplateFormDialogProps {
  template: Template | null
  defaultTemplateId: string | null
  onSave: (
    data: Pick<Template, "name" | "content">,
    isDefault: boolean,
  ) => Promise<void>
  onClose: () => void
  returnFocusRef?: React.RefObject<HTMLElement>
}

interface Errors {
  name?: string
  content?: string
  general?: string
}

export const TemplateFormDialog = ({
  template,
  defaultTemplateId,
  onSave,
  onClose,
  returnFocusRef,
}: TemplateFormDialogProps) => {
  const formId = "template-form"
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    setName(template?.name || "")
    setContent(template?.content || "")
    setIsDefault(template?.id === defaultTemplateId)
    setValidated(false)
    setErrors({})
  }, [template, defaultTemplateId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidated(true)

    const newErrors: Errors = {}

    if (!name.trim()) {
      newErrors.name = "Template name is required"
    }
    if (!content.trim()) {
      newErrors.content = "Template content is required"
    }

    // Validate Handlebars template
    try {
      const renderer = getTemplateRenderer()
      await renderer.validate(content)
    } catch (err) {
      newErrors.content =
        err instanceof Error ? err.message : "Invalid Handlebars syntax"
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      await onSave(
        {
          name: name.trim(),
          content: content.trim(),
        },
        isDefault,
      )
      onClose()
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Failed to save template",
      })
    }
  }

  const handleClose = () => {
    setValidated(false)
    setName("")
    setContent("")
    setIsDefault(false)
    setErrors({})
    onClose()
  }

  return (
    <Dialog
      title={template ? "Edit template" : "Create template"}
      onClose={handleClose}
      width="xlarge"
      height="large"
      returnFocusRef={returnFocusRef}
      footerButtons={[
        {
          buttonType: "default",
          content: "Cancel",
          onClick: handleClose,
        },
        {
          buttonType: "primary",
          content: template ? "Update template" : "Create template",
          type: "submit",
          form: formId,
        },
      ]}
    >
      {errors.general && (
        <Banner
          title="Error"
          variant="critical"
          description={errors.general}
          style={{ marginBottom: 8 }}
        />
      )}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 8 }}>
          <FormControl required>
            <FormControl.Label>Template name</FormControl.Label>
            <TextInput
              type="text"
              name="name"
              placeholder="Sample template"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              validationStatus={validated && errors.name ? "error" : undefined}
              block
            />
            {validated && errors.name && (
              <FormControl.Validation variant="error">
                <span style={{ whiteSpace: "pre-wrap" }}>{errors.name}</span>
              </FormControl.Validation>
            )}
          </FormControl>
        </div>
        <div style={{ marginBottom: 8 }}>
          <FormControl required>
            <FormControl.Label>Template content</FormControl.Label>
            <Textarea
              name="content"
              rows={10}
              placeholder={`{{#each hunkList}}
{{#collapseWhitespace}}\`\`\`{{langId}} {{#if @first}}filePath={{filePath}}{{/if}} newStart={{newStart}} oldStart={{oldStart}}{{/collapseWhitespace}}
{{{code}}}
\`\`\`
{{/each}}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              validationStatus={
                validated && errors.content ? "error" : undefined
              }
              block
              resize="vertical"
              style={{ fontFamily: "monospace" }}
            />
            {validated && errors.content && (
              <FormControl.Validation variant="error">
                <span style={{ whiteSpace: "pre-wrap" }}>{errors.content}</span>
              </FormControl.Validation>
            )}
          </FormControl>
        </div>
        <div style={{ marginBottom: 8 }}>
          <FormControl>
            <Checkbox
              name="default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <FormControl.Label>Set as default template</FormControl.Label>
          </FormControl>
        </div>
      </form>
    </Dialog>
  )
}
