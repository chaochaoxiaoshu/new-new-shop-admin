import {
  BriefcaseBusinessIcon,
  ChartAreaIcon,
  ChartPieIcon,
  ClipboardListIcon,
  HouseIcon,
  type LucideIcon,
  MonitorIcon,
  RssIcon,
  SettingsIcon,
  StoreIcon,
  WalletIcon
} from 'lucide-react'

import { MenuItemData } from '@/api'

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
      if (newItem.children.length > 0) {
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

export function getMatchedItems(items: MenuItemData[], currentPath: string) {
  // 保存所有匹配的路径及其菜单项
  const allMatches: { path: string; items: MenuItemData[] }[] = []

  const findAllMenuPathsByPath = (
    menuList: MenuItemData[],
    targetPath: string,
    parentPath: MenuItemData[] = []
  ): void => {
    for (const item of menuList) {
      const currentPath = [...parentPath, item]

      // 如果当前菜单项有路径且目标路径以它开头
      if (item.path && targetPath.startsWith(item.path)) {
        // 收集匹配项
        allMatches.push({ path: item.path, items: currentPath })
      }

      // 继续递归查找子菜单，不要提前返回
      if (item.children.length > 0) {
        findAllMenuPathsByPath(item.children, targetPath, currentPath)
      }
    }
  }

  // 收集所有匹配项
  findAllMenuPathsByPath(items, currentPath)

  // 按路径长度降序排序，选择最长匹配
  allMatches.sort((a, b) => b.path.length - a.path.length)

  // 返回最长匹配，如果没有匹配则返回空数组
  return allMatches.length > 0 ? allMatches[0].items : []
}
