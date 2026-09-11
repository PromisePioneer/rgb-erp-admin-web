/**
 * Download a Blob as a file
 * Creates a temporary anchor element to trigger download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert a File to FormData for file uploads
 */
export function fileToFormData(file: File, fieldName = 'file'): FormData {
  const formData = new FormData()
  formData.append(fieldName, file)
  return formData
}
