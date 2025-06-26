import { Table, type TableProps } from '@arco-design/web-react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { DndListenersContext } from './context'

export function SortableTable<T extends Record<string, unknown>>(
  props: TableProps<T> & { onSort?: (data: T[]) => void }
) {
  const data = props.data
  const rowKey = props.rowKey

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (!rowKey) return

    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = data?.findIndex(
        (item) => item[rowKey as string] === active.id
      )
      const newIndex = data?.findIndex(
        (item) => item[rowKey as string] === over?.id
      )
      if (oldIndex !== -1 && newIndex !== -1) {
        if (!data || !oldIndex || !newIndex) return
        const newValue = arrayMove(data, oldIndex, newIndex)
        props.onSort?.(newValue)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={data?.map((item) => item[rowKey as string] as string) ?? []}
        strategy={verticalListSortingStrategy}
      >
        <Table
          {...props}
          components={{
            ...props.components,
            body: {
              row: (props: Omit<SortableRowProps<T>, 'rowKey'>) => (
                <SortableRow {...props} rowKey={rowKey as string} />
              )
            }
          }}
        />
      </SortableContext>
    </DndContext>
  )
}

interface SortableRowProps<T extends Record<string, unknown>> {
  children: React.ReactNode
  className: string
  index: number
  record: T
  rowKey: string
}

function SortableRow<T extends Record<string, unknown>>(
  props: SortableRowProps<T>
) {
  const { children, className, record, rowKey, ...rest } = props

  const {
    // biome-ignore lint/correctness/noUnusedVariables: false positive
    attributes: { role, ...restAttributes },
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: record[rowKey] as UniqueIdentifier
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  }

  return (
    <DndListenersContext.Provider value={listeners}>
      <tr
        ref={setNodeRef}
        className={className}
        {...restAttributes}
        {...rest}
        style={style}
      >
        {children}
      </tr>
    </DndListenersContext.Provider>
  )
}
