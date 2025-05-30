/**
 * 检查企业微信 SDK 是否加载完成，超时时间为 5 秒。
 */
export function checkWxApiReady(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.wx !== 'undefined') {
      resolve(true)
      return
    }

    const checkInterval = setInterval(() => {
      if (typeof window.wx !== 'undefined') {
        clearInterval(checkInterval)
        resolve(true)
      }
    }, 100)

    // 设置超时
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve(false)
    }, 5000)
  })
}
