import { useDndListeners } from './context'

interface SortableTableDragHandleProps {
  children: React.ReactNode
}

export function SortableTableDragHandle({
  children
}: SortableTableDragHandleProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const listeners = useDndListeners()

  return <div {...listeners}>{children}</div>
}
