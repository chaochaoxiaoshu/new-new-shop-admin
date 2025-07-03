import { PaginationProps, Table, TableProps } from '@arco-design/web-react'
import { useMemo } from 'react'

import { Show } from './show'
import { useTableSizeContext } from './table-layout/context'

/**
 * 二次封装表格，除了一些必要的默认设置外，从 <TableLayout /> 组件获取了表格区域的高度，使表格滚动而页面不滚动
 */
export function MyTable(props: TableProps) {
  const { height } = useTableSizeContext()

  // 可用高度应该减去该高度即为 Table 滚动区域的高度
  const subtractHeight = useMemo(() => {
    let height = 84
    if (props.summary) {
      height += 41
    }
    return height
  }, [props.summary])

  const pagination = useMemo(() => {
    if (typeof props.pagination === 'object') {
      return {
        ...props.pagination,
        showJumper: true,
        sizeCanChange: true,
        pageSizeChangeResetCurrent: true
      }
    }
    return props.pagination
  }, [props.pagination])

  return (
    <Table
      {...props}
      scroll={{ x: props.scroll?.x, y: height ? height - subtractHeight : 1 }}
      pagination={pagination}
      renderPagination={(paginationNode) => (
        <div className='flex justify-between items-center mt-4'>
          <Show when={typeof props.pagination === 'object'}>
            <span>共 {(props.pagination as PaginationProps).total} 条</span>
          </Show>
          {paginationNode}
        </div>
      )}
    />
  )
}
