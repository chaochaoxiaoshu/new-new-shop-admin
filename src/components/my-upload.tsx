import { Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Image, Spin } from '@arco-design/web-react'

import { ApiResponse } from '@/api'
import { api, cn, generateId } from '@/lib'

export type MyUploadItem = {
  id: string
  response_id?: string
  url?: string
  file?: File
  status: 'uploading' | 'done' | 'error'
}

interface MyUploadProps {
  value?: MyUploadItem[]
  onChange?: (value: MyUploadItem[]) => void
  multiple?: boolean
}

export function MyUpload(props: MyUploadProps) {
  const { multiple = false, value = [], onChange } = props

  const latestValueRef = useRef(value)
  useEffect(() => {
    latestValueRef.current = value
  }, [value])

  const isShowTrigger = multiple ? value.length < 8 : value.length === 0

  const handleRemove = (id: string) => {
    onChange?.(value.filter((item) => item.id !== id))
  }

  // 渲染预览图
  const renderPreview = (item: MyUploadItem) => {
    const imgNode =
      item.status === 'done' && item.url ? (
        <Image
          src={item.url}
          className='absolute inset-0'
          width={80}
          height={80}
          style={{ objectFit: 'cover', overflow: 'hidden' }}
        />
      ) : item.file ? (
        <Image
          src={URL.createObjectURL(item.file)}
          className='absolute inset-0'
          width={80}
          height={80}
          style={{ objectFit: 'cover', overflow: 'hidden' }}
        />
      ) : null

    return (
      <div className='relative group w-20 h-20'>
        {imgNode}
        <button
          className='absolute top-1 right-1 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow group-hover:opacity-100 opacity-80 transition'
          onClick={() => handleRemove(item.id)}
          type='button'
          tabIndex={-1}
        >
          <X className='w-4 h-4 text-gray-500' />
        </button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-3 gap-4'>
      {value.map((item) => (
        <div
          key={item.id}
          className='relative size-20 border rounded overflow-hidden bg-gray-50 flex items-center justify-center'
        >
          {renderPreview(item)}
          {item.status === 'uploading' && (
            <div className='absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-400'>
              <Spin />
            </div>
          )}
          {item.status === 'error' && (
            <div className='absolute inset-0 bg-red-200/80 flex items-center justify-center text-xs text-red-600'>
              <X className='inline size-4' />
            </div>
          )}
        </div>
      ))}
      {isShowTrigger && (
        <MyUploadTrigger
          multiple={multiple}
          limit={multiple ? 8 - value.length : undefined}
          onStart={(newItems) => {
            onChange?.([...latestValueRef.current, ...newItems])
          }}
          onSuccess={(item) => {
            onChange?.(
              latestValueRef.current.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      response_id: item.response_id,
                      url: item.url,
                      status: 'done'
                    }
                  : i
              )
            )
          }}
          onError={(item) => {
            onChange?.(
              latestValueRef.current.map((i) =>
                i.id === item.id ? { ...i, status: 'error' } : i
              )
            )
          }}
        />
      )}
    </div>
  )
}

interface MyUploadTriggerProps {
  multiple: boolean
  limit?: number
  onStart?: (items: MyUploadItem[]) => void // 支持批量
  onSuccess?: (item: MyUploadItem) => void
  onError?: (item: MyUploadItem) => void
}

function MyUploadTrigger(props: MyUploadTriggerProps) {
  const { multiple, limit, onStart, onSuccess, onError } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleClick = () => {
    if (uploading) return
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    let files = Array.from(e.target.files)
    if (typeof limit === 'number' && files.length > limit) {
      files = files.slice(0, limit)
    }

    setUploading(true)
    // 1. 先批量 setItems
    const uploadItems = files.map((file) => ({
      id: generateId(),
      file,
      status: 'uploading' as const
    }))
    onStart?.(uploadItems)

    // 2. 并发上传
    await Promise.all(
      uploadItems.map(async (item) => {
        const formData = new FormData()
        formData.append('file', item.file!)
        try {
          const response = await api.post<
            ApiResponse<{ id: string; name: string; url: string }>
          >('jshop-website/api/v1/upload', { body: formData })
          const data = await response.json()
          onSuccess?.({
            id: item.id,
            response_id: data.result.id,
            url: data.result.url,
            status: 'done'
          })
        } catch {
          onError?.({ id: item.id, file: item.file, status: 'error' })
        }
      })
    )
    setUploading(false)
    // 清空 input
    e.target.value = ''
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center size-20 bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-200 transition-colors duration-200',
        uploading ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <Plus className='size-6 text-gray-400' />
      <input
        ref={inputRef}
        type='file'
        multiple={multiple}
        accept='image/*'
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
