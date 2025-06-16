import { useCallback, useLayoutEffect, useState } from 'react'

/**
 * 在 React 提交更新之后、浏览器绘制之前获取给定元素的高度。
 *
 * 这个钩子用于在 TableLayout 中测量 Table 的可用空间，
 * 获取到的高度用于给 Table 设置 scrollY。
 */
export function useClientHeight<T extends HTMLElement>(
  ref: React.RefObject<T>
) {
  const [height, setHeight] = useState<number>()

  const updateHeight = useCallback(() => {
    setHeight(() => ref.current?.clientHeight)
  }, [ref])

  useLayoutEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(ref.current)
    const mutationObserver = new MutationObserver(updateHeight)
    mutationObserver.observe(ref.current, {
      childList: true,
      subtree: true,
      characterData: true
    })

    updateHeight()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [ref])

  return { height }
}
