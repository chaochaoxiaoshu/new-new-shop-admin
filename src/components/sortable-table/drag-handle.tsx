import { useDndListeners } from './context'

interface SortableTableDragHandleProps {
  children: React.ReactNode
}

export function SortableTableDragHandle({
  children
}: SortableTableDragHandleProps) {
  const listeners = useDndListeners()

  return <div {...listeners}>{children}</div>
}
