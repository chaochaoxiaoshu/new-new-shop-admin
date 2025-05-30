import React, { useEffect, useMemo, useState } from 'react'
import { getMenuList } from '@/api/common/get-menu-list'
import {
  getMatchedItems,
  getMenuListWithIcons,
  processMenuList,
} from '@/helpers/menu'
import { Menu } from '@arco-design/web-react'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '@/stores/user-store'
import { useLocation, useNavigate } from '@tanstack/react-router'

export const Sidebar = React.memo(() => {
  const {
    menuList,
    selectedKeys,
    openKeys,
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
        onClickMenuItem={handleClickMenuItem}
        onClickSubMenu={handleClickSubMenu}
      >
        {menuList.map((item) => {
          if (item.children && item.children.length > 0) {
            return (
              <Menu.SubMenu
                key={item.path}
                title={
                  <div className='flex items-center'>
                    <item.meta.icon className='size-5 mr-4' />
                    <span>{item.name}</span>
                  </div>
                }
              >
                {item.children.map((childItem) => (
                  <Menu.Item key={childItem.path}>
                    <div className='pl-4'>{childItem.name}</div>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            )
          } else {
            return (
              <Menu.Item key={item.path}>
                <div className='flex items-center'>
                  {item.meta.icon && <item.meta.icon className='size-5 mr-4' />}
                  <span>{item.name}</span>
                </div>
              </Menu.Item>
            )
          }
        })}
      </Menu>
    </div>
  )
})

function useMenuList() {
  const location = useLocation()
  const pathname = location.pathname.replace('/newmanage', '')
  const navigate = useNavigate()

  const isAuthenticated = useUserStore((store) => store.isAuthenticated())

  /**
   * 请求菜单数据，前提是已登录并获取了 token
   */
  const { data: menuData } = useQuery({
    queryKey: ['menu-list'],
    queryFn: getMenuList,
    enabled: isAuthenticated,
  })
  /**
   * 补全了图标和 path 后的菜单数据
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
   * 当前选中的 keys(paths)
   */
  const selectedKeys = useMemo(
    () => matchedItems.map((item) => item.path) ?? [],
    [matchedItems]
  )
  /**
   * 当前打开的 SubMenu
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

  const handleClickMenuItem = (path: string) => {
    navigate({ to: path })
  }

  return {
    menuList,
    selectedKeys,
    openKeys,
    handleClickMenuItem,
    handleClickSubMenu,
  }
}
