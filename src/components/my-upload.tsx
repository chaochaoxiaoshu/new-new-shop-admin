import { CircleAlert, GripVertical, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Spin } from '@arco-design/web-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { ApiResponse } from '@/api'
import { api, cn, generateId } from '@/lib'

import { MyImage } from './my-image'
import { MyVideoPreview } from './my-video-preview'

export type MyUploadResource = {
  id: string
  /**
   * 后端返回的资源 ID，有时用于表单提交
   */
  response_id?: string
  /**
   * 资源类型
   */
  type: 'image' | 'video'
  /**
   * 上传状态
   */
  status: 'uploading' | 'done' | 'error'
  /**
   * 资源 URL
   */
  url: string

  /**
   * 资源的文件对象，仅在上传中或上传失败时存在
   */
  file?: File

  // 可以附带其他数据
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Record<string, any>
}

interface MyUploadProps {
  /**
   * 受控模式下的值
   */
  value?: MyUploadResource[]
  /**
   * 受控模式下更新值的回调
   */
  onChange?: (value: MyUploadResource[]) => void
  /**
   * 是否允许多选
   */
  multiple?: boolean
  /**
   * 限制上传数量
   */
  limit?: number
  /**
   * 接受的文件类型
   */
  accept?: 'image' | 'video'
  className?: string
  itemSize?: number

  renderOverlay?: (item: MyUploadResource) => React.ReactNode
}

/**
 * 图片/视频上传组件，支持单个或多个上传，支持预览
 *
 * 回显时使用 createMyUploadItem 辅助函数创建 MyUploadItem
 */
export function MyUpload(props: MyUploadProps) {
  const {
    multiple = false,
    value = [],
    onChange,
    accept = 'image',
    limit,
    className,
    itemSize = 80,
    renderOverlay
  } = props

  // [TODO]: 支持非受控模式

  // 使用 ref 获取最新 value 的引用，避免在 onChange 中使用 value 的值导致循环渲染
  const latestValueRef = useRef(value)
  useEffect(() => {
    latestValueRef.current = value
  }, [value])

  // 拖拽状态
  const [activeId, setActiveId] = useState<string | null>(null)

  // dnd-kit 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // 是否显示上传触发器，单选模式下最多可以选择 1 个，多选模式下最多可以选择 9 个
  const isShowTrigger = multiple ? value.length < 9 : value.length === 0
  // 多选模式下，限制最多可以选择 9 个
  const finalLimit = limit ?? (multiple ? 9 - value.length : undefined)

  /**
   * 开始上传时将文件添加到 value 中
   */
  const handleInsert = (items: MyUploadResource[]) => {
    onChange?.([...latestValueRef.current, ...items])
  }

  /**
   * 上传成功时更新 value 中的资源
   */
  const handleUpdate = (item: MyUploadResource) => {
    onChange?.(latestValueRef.current.map((i) => (i.id === item.id ? item : i)))
  }

  /**
   * 移除资源时更新 value
   */
  const handleRemove = (item: MyUploadResource) => {
    // 如果在上传时移除，需要释放 URL
    if (item.status === 'uploading' && item.file && item.url) {
      URL.revokeObjectURL(item.url)
    }
    onChange?.(value.filter((i) => i.id !== item.id))
  }

  /**
   * 上传失败时更新 value 中的资源状态
   */
  const handleError = (id: string) => {
    onChange?.(
      latestValueRef.current.map((i) =>
        i.id === id ? { ...i, status: 'error' } : i
      )
    )
  }

  /**
   * 处理拖拽开始
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((item) => item.id === active.id)
      const newIndex = value.findIndex((item) => item.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newValue = arrayMove(value, oldIndex, newIndex)
        onChange?.(newValue)
      }
    }

    setActiveId(null)
  }

  /**
   * 渲染预览图
   */
  const activeItem = activeId
    ? value.find((item) => item.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('grid grid-cols-3 gap-3 w-fit', className)}>
        <SortableContext
          items={value.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          {value.map((item) => (
            <SortableUploadItem
              key={item.id}
              item={item}
              itemSize={itemSize}
              multiple={multiple}
              onRemove={handleRemove}
              renderOverlay={renderOverlay}
            />
          ))}
        </SortableContext>
        {isShowTrigger && (
          <MyUploadTrigger
            multiple={multiple}
            limit={finalLimit}
            accept={accept}
            itemSize={itemSize}
            onStart={handleInsert}
            onSuccess={handleUpdate}
            onError={handleError}
          />
        )}
      </div>
      <DragOverlay>
        {activeItem && (
          <div
            className='relative border rounded overflow-hidden bg-gray-50 flex items-center justify-center shadow-lg'
            style={{ width: itemSize, height: itemSize }}
          >
            <UploadItemPreview item={activeItem} itemSize={itemSize} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

interface SortableUploadItemProps {
  item: MyUploadResource
  itemSize: number
  multiple: boolean
  onRemove: (item: MyUploadResource) => void
  renderOverlay?: (item: MyUploadResource) => React.ReactNode
}

function SortableUploadItem(props: SortableUploadItemProps) {
  const { item, itemSize, multiple, onRemove, renderOverlay } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: item.id, disabled: !multiple })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  }

  // 渲染预览内容
  let previewNode: React.ReactNode
  if (item.type === 'image') {
    previewNode = item.url && (
      <MyImage src={item.url} width={itemSize} height={itemSize} />
    )
  } else {
    previewNode = item.url && (
      <MyVideoPreview src={item.url} width={itemSize} height={itemSize} />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        width: itemSize,
        height: itemSize
      }}
      className={cn(
        'relative border rounded overflow-hidden bg-gray-50 flex items-center justify-center group'
      )}
      {...attributes}
    >
      {previewNode}

      {/* 删除按钮 */}
      <button
        className='absolute top-1 right-1 z-10 bg-black/20 backdrop-blur-lg rounded-full p-1 shadow transition hover:scale-110 ease-out duration-200'
        onClick={() => onRemove(item)}
        type='button'
        tabIndex={-1}
      >
        <X className='w-4 h-4 text-white' />
      </button>

      {/* 拖拽句柄 */}
      {multiple && (
        <div
          className='absolute top-1 left-1 z-10 bg-black/20 backdrop-blur-lg rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing'
          {...listeners}
        >
          <GripVertical className='w-3 h-3 text-white pointer-events-none' />
        </div>
      )}

      {/* 上传状态覆盖层 */}
      {item.status === 'uploading' && (
        <div className='absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-400'>
          <Spin />
        </div>
      )}
      {item.status === 'error' && (
        <div className='absolute inset-0 bg-red-100/80 flex items-center justify-center text-xs text-red-500'>
          <CircleAlert className='inline size-8' />
        </div>
      )}

      {/* 渲染自定义覆盖层 */}
      {renderOverlay && renderOverlay(item)}
    </div>
  )
}

interface UploadItemPreviewProps {
  item: MyUploadResource
  itemSize: number
}

function UploadItemPreview({ item, itemSize }: UploadItemPreviewProps) {
  let previewNode: React.ReactNode
  if (item.type === 'image') {
    previewNode = item.url && (
      <MyImage src={item.url} width={itemSize} height={itemSize} />
    )
  } else {
    previewNode = item.url && (
      <MyVideoPreview src={item.url} width={itemSize} height={itemSize} />
    )
  }

  return previewNode
}

interface MyUploadTriggerProps {
  accept: 'image' | 'video'
  multiple: boolean
  limit?: number
  itemSize?: number
  onStart?: (items: MyUploadResource[]) => void
  onSuccess?: (item: MyUploadResource) => void
  onError?: (id: string) => void
}

function MyUploadTrigger(props: MyUploadTriggerProps) {
  const { accept, multiple, limit, itemSize, onStart, onSuccess, onError } =
    props

  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleClick = () => {
    if (uploading) return
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    let files = Array.from(e.target.files)
    if (typeof limit !== 'undefined' && files.length > limit) {
      files = files.slice(0, limit)
    }

    setUploading(true)
    // 1. 先批量 setItems
    const uploadItems: MyUploadResource[] = files.map((file) => ({
      id: generateId(),
      url: URL.createObjectURL(file),
      file,
      type: accept,
      status: 'uploading' as const
    }))
    onStart?.(uploadItems)

    const upload = async (item: MyUploadResource) => {
      const formData = new FormData()
      formData.append('file', item.file!)
      if (accept === 'video') {
        formData.append('action', 'video')
      }
      try {
        const response = await api.post<
          ApiResponse<{ id: string; name: string; url: string }>
        >('jshop-website/api/v1/upload', { body: formData })
        const data = await response.json()
        onSuccess?.({
          id: item.id,
          response_id: data.result.id,
          url: data.result.url,
          type: item.type,
          status: 'done'
        })
        // 上传成功后释放临时 URL 的资源
        setTimeout(() => URL.revokeObjectURL(item.url), 100)
      } catch (error) {
        console.error(error)
        onError?.(item.id)
      }
    }

    // 2. 并发上传
    await Promise.all(uploadItems.map(upload))
    setUploading(false)

    e.target.value = ''
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-200 transition-colors duration-200',
        uploading ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      style={{
        width: itemSize,
        height: itemSize
      }}
      onClick={handleClick}
    >
      <Plus className='size-6 text-gray-400' />
      <input
        ref={inputRef}
        type='file'
        multiple={multiple}
        accept={accept === 'image' ? 'image/*' : 'video/*'}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
