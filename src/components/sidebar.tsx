import React, { useEffect, useMemo, useState } from 'react'
import { getMenuList, MenuItemData } from '@/api/common/get-menu-list'
import {
  getMatchedItems,
  getMenuListWithIcons,
  processMenuList,
} from '@/helpers/menu'
import { Menu } from '@arco-design/web-react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

type MenuItemWithIcon = MenuItemData & { meta?: { icon: LucideIcon } }

function renderMenu(
  items: MenuItemWithIcon[],
  handlePreloadRoute: (path: string) => void
) {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return (
        <Menu.SubMenu
          key={item.path}
          title={
            <>
              {item.meta?.icon && (
                <item.meta.icon className='inline size-5 mr-4' />
              )}
              {item.name}
            </>
          }
        >
          {renderMenu(item.children, handlePreloadRoute)}
        </Menu.SubMenu>
      )
    } else {
      return (
        <Menu.Item
          key={item.path}
          onMouseEnter={() => handlePreloadRoute(item.path)}
        >
          {item.meta?.icon && <item.meta.icon className='inline size-5 mr-4' />}
          {item.name}
        </Menu.Item>
      )
    }
  })
}

export const Sidebar = React.memo(() => {
  const {
    menuList,
    selectedKeys,
    openKeys,
    handlePreloadRoute,
    handleClickSubMenu,
    handleClickMenuItem,
  } = useMenuList()

  return (
    <div className='h-full border-r'>
      <Menu
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        hasCollapseButton
        style={{
          width: 220,
          height: '100%',
          overflowY: 'auto',
        }}
        levelIndent={36}
        onClickSubMenu={handleClickSubMenu}
        onClickMenuItem={handleClickMenuItem}
      >
        {renderMenu(menuList, handlePreloadRoute)}
      </Menu>
    </div>
  )
})

function useMenuList() {
  const location = useLocation()
  const pathname = location.pathname.replace('/newmanage', '')

  const navigate = useNavigate()
  const router = useRouter()

  const CACHE_KEY = 'menu-list-cache'

  /**
   * 菜单数据，菜单项有 path，子菜单没有 path
   */
  const { data: menuData } = useQuery({
    queryKey: ['menu-list'],
    queryFn: getMenuList,
    /**
     * staleTime 这里设置成 0，是因为普通的路由跳转不会导致重新请求 menuData，
     * 只有刷新页面或重新登录时会，所以不需要缓存这个请求
     * 而重新登录时又必须马上刷新这个数据，否则看起来像是 bug
     */
    staleTime: 0,
    /**
     * 这里把缓存在 localStorage 中的数据当作占位数据，避免刷新页面时左侧侧边栏闪烁
     */
    placeholderData: () => {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return
      return JSON.parse(cached) as Partial<{ items: MenuItemData[] }>
    },
  })

  useEffect(() => {
    if (menuData) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(menuData))
    }
  }, [menuData])

  /**
   * 补全了一级子菜单的图标和子菜单的 path 后的菜单数据
   */
  const menuList = useMemo(
    () => processMenuList(getMenuListWithIcons(menuData?.items || [])),
    [menuData]
  )

  /**
   * 当前路由匹配的菜单项列表（从菜单树自上而下）
   */
  const matchedItems = useMemo(
    () => getMatchedItems(menuList, pathname),
    [menuList, pathname]
  )

  /**
   * 当前选中的 keys(paths)（从菜单树自上而下）
   */
  const selectedKeys = useMemo(
    () => matchedItems.map((item) => item.path) ?? [],
    [matchedItems]
  )
  /**
   * 当前打开的 SubMenu，跟随路由变化，也跟随子菜单点击交互变化
   */
  const [openKeys, setOpenKeys] = useState<string[]>([])

  /**
   * 路由发生变化时，更新 openKeys
   */
  useEffect(() => {
    if (matchedItems.length === 0) return

    const newOpenKeys = matchedItems
      .filter((item) => item.children && item.children.length > 0)
      .map((item) => item.path)

    setOpenKeys(newOpenKeys)
  }, [matchedItems])

  const handleClickSubMenu = (path: string) => {
    const [depth] = path.split('-')
    // 二级以上的展开菜单
    if (Number(depth) >= 2) {
      if (openKeys.includes(path)) {
        setOpenKeys((prev) => [...prev.slice(0, -1)])
      } else {
        setOpenKeys((prev) => [...prev, path])
      }
      return
    }
    // 一级展开菜单
    if (openKeys.includes(path)) {
      setOpenKeys([])
    } else {
      setOpenKeys([path])
    }
  }

  const handlePreloadRoute = (path: string) => {
    try {
      router.preloadRoute({ to: path })
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickMenuItem = (path: string) => {
    navigate({ to: path })
  }

  return {
    menuList,
    selectedKeys,
    openKeys,
    handlePreloadRoute,
    handleClickMenuItem,
    handleClickSubMenu,
  }
}
