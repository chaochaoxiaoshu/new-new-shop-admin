import { MyUploadResource } from '@/components/my-upload'
import { generateId } from '@/lib'

interface createMyUploadResourceOptions {
  id?: string
  type: 'image' | 'video'
  url: string
  // biome-ignore lint/suspicious/noExplicitAny: false
  payload?: Record<string, any>
}

export function createMyUploadResource(
  options: createMyUploadResourceOptions
): MyUploadResource {
  const { id, type, url, payload } = options

  const finalId = id || generateId()

  return {
    id: finalId,
    response_id: finalId,
    type,
    status: 'done',
    url,
    payload
  }
}
