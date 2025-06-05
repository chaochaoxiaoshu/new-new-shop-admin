import { useEffect, useState } from 'react'

import { Breadcrumb } from '@arco-design/web-react'
import { useRouter } from '@tanstack/react-router'

import { type RouteTreeNode, routeTree } from '@/helpers'

/**
 * 递归查找与给定路径匹配的路由数组，用于渲染面包屑
 */
function findPath(
  root: RouteTreeNode,
  targetPath: string,
  path: RouteTreeNode[] = []
): RouteTreeNode[] | null {
  path.push(root)
  if (root.path === targetPath) {
    return path
  }

  if (root.children && root.children.length > 0) {
    for (const child of root.children) {
      const newPath = [...path]
      const result = findPath(child, targetPath, newPath)
      if (result) {
        return result
      }
    }
  }

  return null
}

export function MyBreadcrumb() {
  const router = useRouter()

  const [matchedRoutes, setMatchedRoutes] = useState<RouteTreeNode[]>([])

  useEffect(() => {
    const pathname = router.latestLocation.pathname.replace('/newmanage', '')
    const matched = findPath(routeTree, pathname)
    if (!matched) return
    setMatchedRoutes(matched)

    const cancel = router.subscribe('onLoad', (e) => {
      const pathname = e.toLocation.pathname.replace('/newmanage', '')
      const matched = findPath(routeTree, pathname)
      if (!matched) return
      setMatchedRoutes(matched)
    })

    return cancel
  }, [router])

  return (
    <Breadcrumb>
      {matchedRoutes.map((route) => (
        <Breadcrumb.Item key={route.name.toString()}>
          {typeof route.name === 'string' ? (
            <span className='cursor-default'>{route.name}</span>
          ) : (
            <route.name className='inline size-4' />
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )
}
