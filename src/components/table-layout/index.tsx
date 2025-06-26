import { useRef } from 'react'
import { useClientHeight } from '@/hooks'
import { BaseLayout } from '../base-layout'
import { TableSizeContext } from './context'

interface TableLayoutProps {
  header?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/**
 * 表格视图的布局组件，向下提供一个表格区域的高度，在 <MyTable /> 中使用该值使表格自适应高度（表格滚动而页面不滚动）
 */
export function TableLayout(props: TableLayoutProps) {
  const { header, className, children } = props

  const tableAreaRef = useRef<HTMLDivElement>(null)
  const { height } = useClientHeight(tableAreaRef)

  return (
    <TableSizeContext.Provider value={{ height }}>
      <BaseLayout className={className}>
        {header}
        {/* 使用一个绝对定位，防止 Table 撑起容器的高度，影响高度计算 */}
        <div className='relative flex-auto mt-6' ref={tableAreaRef}>
          <div className='absolute inset-0'>{children}</div>
        </div>
      </BaseLayout>
    </TableSizeContext.Provider>
  )
}
