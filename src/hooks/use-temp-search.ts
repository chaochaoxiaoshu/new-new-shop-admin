import { useState } from 'react'

interface UseTempSearchOptions<TSearch> {
  search: TSearch
  updateFn: (search: TSearch) => void
  selectDefaultFields: (search: TSearch) => TSearch
}

/**
 * 管理表格筛选的临时状态
 *
 * 解决问题：表格查询参数直接绑定到 URL 搜索参数时，每次输入都会触发查询
 * 使用场景：
 * - 表单输入时仅更新临时状态
 * - 点击查询按钮时才将临时状态提交到 URL 搜索参数
 * - 点击重置按钮时恢复默认字段并提交
 */
export function useTempSearch<TSearch extends Record<string, unknown>>(
  options: UseTempSearchOptions<TSearch>
) {
  const { search, updateFn, selectDefaultFields } = options

  const [tempSearch, setTempSearch] = useState(search)

  const updateSearchField = (
    key: keyof TSearch,
    value: TSearch[keyof TSearch]
  ) => {
    setTempSearch((prev) => ({ ...prev, [key]: value }))
  }

  const commit = () => updateFn(tempSearch)

  const reset = () => {
    const defaultSearch = selectDefaultFields(tempSearch)
    setTempSearch(defaultSearch)
    updateFn(defaultSearch)
  }

  return {
    tempSearch,
    setTempSearch,
    updateSearchField,
    commit,
    reset
  }
}
