export function getExportBaseUrl() {
  if (import.meta.env.DEV) {
    return 'https://shop.shanshu.work'
  } else {
    return window.location.origin
  }
}

export function generateExportUrl(
  apiUrl: string,
  search: Record<string, unknown>
) {
  const url = new URL(getExportBaseUrl() + apiUrl)
  Object.entries(search).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

export function downloadFile(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', '')
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
