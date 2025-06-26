import { Button, Modal } from '@arco-design/web-react'
import { Play, X } from 'lucide-react'
import { useState } from 'react'

interface MyVideoPreviewProps {
  src: string
  width?: number
  height?: number
}

export function MyVideoPreview(props: MyVideoPreviewProps) {
  const { src, width, height } = props

  const [visible, setVisible] = useState(false)

  return (
    <>
      <div className='relative cursor-zoom-in' onClick={() => setVisible(true)}>
        <video
          src={src}
          width={width}
          height={height}
          style={{
            objectFit: 'cover',
            overflow: 'hidden',
            width,
            height
          }}
        />
        <div className='absolute inset-0 bg-black/40 flex justify-center items-center'>
          <Play className='size-6 text-white' fill='white' />
        </div>
      </div>
      <Modal
        visible={visible}
        footer={null}
        style={{ maxWidth: 800 }}
        closeIcon={
          <Button
            shape='circle'
            type='text'
            icon={<X className='inline size-4 text-foreground' />}
            onClick={() => setVisible(false)}
          />
        }
        onCancel={() => setVisible(false)}
      >
        <video
          src={src}
          controls
          autoPlay
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            background: '#000'
          }}
        />
      </Modal>
    </>
  )
}
