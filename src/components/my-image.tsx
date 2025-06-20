import { useState } from 'react'

import { Image, ImageProps } from '@arco-design/web-react'

import imagePlaceholder from '@/assets/image_placeholder.svg'
import { cn } from '@/lib'

/**
 * 替换组件库的 Image 组件，修复与 tailwind preflight 的兼容问题
 */
export function MyImage(props: ImageProps) {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [error, setError] = useState(false)

  return (
    <>
      <img
        src={error ? imagePlaceholder : props.src}
        className={cn(
          'inline-block object-cover overflow-hidden',
          error ? 'cursor-not-allowed' : 'cursor-zoom-in',
          props.className
        )}
        width={props.width}
        height={props.height}
        style={{
          width: props.width,
          height: props.height
        }}
        onClick={() => !error && setPreviewVisible(true)}
        onError={() => setError(true)}
      />
      <Image.Preview
        src={props.src ?? ''}
        visible={previewVisible}
        onVisibleChange={setPreviewVisible}
      />
    </>
  )
}
