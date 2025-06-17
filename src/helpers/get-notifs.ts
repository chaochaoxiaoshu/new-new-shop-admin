import { Notification } from '@arco-design/web-react'

interface GetNotifsOptions {
  /**
   * 通知的 key
   */
  key: string
  /**
   * 操作成功后的回调
   */
  onSuccess?: () => Promise<unknown>
}

/**
 * 在执行 mutation 时显示通知
 */
export function getNotifs(options: GetNotifsOptions) {
  const { key, onSuccess } = options

  return {
    onMutate: () => {
      Notification.info({ id: key, content: '正在操作...' })
    },
    onSuccess: async () => {
      await onSuccess?.()
      Notification.success({ id: key, content: '操作成功' })
    },
    onError: (error: Error) => {
      Notification.error({
        id: key,
        content: `操作失败: ${error.message}`
      })
    }
  }
}
