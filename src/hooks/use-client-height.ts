import { useCallback, useEffect, useState } from "react"

export function useClientHeight<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [height, setHeight] = useState<number>()

  const updateHeight = useCallback(() => {
    setHeight(() => ref.current?.clientHeight)
  }, [ref])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateHeight)
    if (ref.current) {
      resizeObserver.observe(ref.current)
    }
    const mutationObserver = new MutationObserver(updateHeight)
    if (ref.current) {
      mutationObserver.observe(ref.current, {
        childList: true,
        subtree: true,
        characterData: true
      })
    }
    updateHeight()
    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return { height }
}