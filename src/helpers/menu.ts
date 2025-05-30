import { MenuItemData } from '@/api/common/get-menu-list'
import {
  BriefcaseBusinessIcon,
  ChartAreaIcon,
  ChartPieIcon,
  ClipboardListIcon,
  HouseIcon,
  MonitorIcon,
  RssIcon,
  SettingsIcon,
  StoreIcon,
  WalletIcon,
  type LucideIcon
} from 'lucide-react'

export function getMenuListWithIcons(menuList: MenuItemData[]) {
  const icons: Record<string, LucideIcon> = {
    首页: HouseIcon,
    商品: StoreIcon,
    客户: ChartPieIcon,
    订单: BriefcaseBusinessIcon,
    营销: MonitorIcon,
    财务: ClipboardListIcon,
    统计: ChartAreaIcon,
    钱包: WalletIcon,
    站点: RssIcon,
    设置: SettingsIcon
  }
  return menuList.map((item) => ({
    ...item,
    meta: { icon: icons[item.name] }
  }))
}

export function processMenuList(
  items: (MenuItemData & { meta: { icon: LucideIcon } })[]
) {
  const processMenuItems = (
    items: (MenuItemData & { meta: { icon: LucideIcon } })[]
  ): (MenuItemData & { meta: { icon: LucideIcon } })[] => {
    return items.map((item) => {
      // 深拷贝当前项
      const newItem = { ...item }
      // 如果有子项，将 path 设置为 name
      if (newItem.children && newItem.children.length > 0) {
        newItem.path = `${newItem.depth}-${newItem.name}`
        // 递归处理子项
        newItem.children = processMenuItems(
          newItem.children as (MenuItemData & { meta: { icon: LucideIcon } })[]
        )
      }
      return newItem
    })
  }
  return processMenuItems(items)
}
