import { useMemo } from 'react'

import { Table, TableProps } from '@arco-design/web-react'

import { useTableSizeContext } from './table-layout/context'

/**
 * 二次封装表格，除了一些必要的默认设置外，从 <TableLayout /> 组件获取了表格区域的高度，使表格滚动而页面不滚动
 */
export function MyTable(props: TableProps) {
  const { height } = useTableSizeContext()

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
      borderCell
      scroll={{ x: props.scroll?.x, y: height - 84 }}
      style={{ height: `${height}px` }}
      pagination={pagination}
      renderPagination={(paginationNode) => (
        <div className='flex justify-between items-center mt-4'>
          {typeof props.pagination === 'object' && <span>共 {props.pagination?.total} 条</span>}
          {paginationNode}
        </div>
      )}
    />
  )
}
