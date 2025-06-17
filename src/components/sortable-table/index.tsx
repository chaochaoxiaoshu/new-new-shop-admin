import React from 'react'

import { Table, type TableProps } from '@arco-design/web-react'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { DndListenersContext } from './context'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function SortableTable<T extends Record<string, unknown>>(
  props: TableProps & { onSort?: (data: T[]) => void }
) {
  const data = props.data as T[] | undefined
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
        strategy={rectSortingStrategy}
      >
        <Table
          {...props}
          components={{
            body: {
              row: (props: Omit<SortableRowProps<T>, 'rowKey'>) =>
                SortableRow({ ...props, rowKey: rowKey as string })
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
  const { children, className, record, rowKey } = props

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        style={style}
      >
        {children}
      </tr>
    </DndListenersContext.Provider>
  )
}
