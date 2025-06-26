import React, { ReactNode } from 'react'

interface ShowProps<T> {
  /**
   * 决定是否渲染子元素或回退内容的条件
   */
  when: T | undefined | null | false
  /**
   * 当条件为真时渲染的内容
   */
  children: ReactNode | ((item: NonNullable<T>) => ReactNode)
  /**
   * 当条件为假时渲染的内容
   */
  fallback?: ReactNode
}

/**
 * 用于条件渲染的 Show 组件，类似于 SolidJS 的 Show 组件
 *
 * @example
 * ```tsx
 * <Show
 *   when={user}
 *   fallback={<p>加载中...</p>}
 * >
 *   {(user) => <p>你好，{user.name}！</p>}
 * </Show>
 * ```
 *
 * @example
 * ```tsx
 * <Show when={isLoggedIn}>
 *   <LoggedInContent />
 * </Show>
 * ```
 */
export function Show<T>(props: ShowProps<T>): React.JSX.Element | null {
  const { when, children, fallback } = props

  if (when) {
    if (typeof children === 'function') {
      return <>{children(when)}</>
    }

    return <>{children}</>
  }

  if (fallback !== undefined) {
    return <>{fallback}</>
  }

  return null
}
