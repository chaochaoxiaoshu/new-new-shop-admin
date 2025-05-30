import { useMemo } from 'react'
import { getMenuList } from '@/api/common/get-menu-list'
import { getMenuListWithIcons, processMenuList } from '@/helpers/menu'
import { Menu } from '@arco-design/web-react'
import { useQuery } from '@tanstack/react-query'

export function Sidebar() {
  const { data: menuData } = useQuery({
    queryKey: ['menu-list'],
    queryFn: getMenuList
  })
  const menuList = useMemo(
    () => processMenuList(getMenuListWithIcons(menuData?.items || [])),
    [menuData]
  )

  return (
    <div className='h-full border-r'>
      <Menu style={{ width: 220, height: '100%' }} hasCollapseButton>
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
}
