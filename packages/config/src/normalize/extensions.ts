import { formatDocsMintDocForms, isDocsMintDocForm } from '../registry/doc-forms.js'
import { validateCollectionRender } from '../registry/collection-render.js'
import type { DocsMintConfig } from '../schema/index.js'

export function validateRenderingExtensions(extensions: DocsMintConfig['extensions']): void {
  const docForms = extensions?.docForms
  if (!docForms) {
    return
  }
  for (const [formKey, descriptor] of Object.entries(docForms)) {
    if (!formKey || !/^[a-z][a-z0-9-]*$/.test(formKey)) {
      throw new Error(
        `extensions.docForms keys must be lowercase identifiers (got "${formKey}").`,
      )
    }
    if (isDocsMintDocForm(formKey)) {
      throw new Error(
        `extensions.docForms.${formKey} is reserved. Built-in forms are: ${formatDocsMintDocForms()}.`,
      )
    }
    validateCollectionRender(`extensions.docForms.${formKey}`, descriptor)
  }
}
