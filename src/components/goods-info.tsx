import { MyImage } from './my-image'

interface GoodsInfoProps {
  imageUrl?: string
  name?: string
  price?: number
  quantity?: number
}

export function GoodsInfo(props: GoodsInfoProps) {
  const { imageUrl, name, price, quantity } = props
  return (
    <div className='flex items-stretch space-x-4'>
      <MyImage className='flex-none' src={imageUrl} width={56} height={56} />
      <div className='flex-auto flex items-stretch'>
        <div className='flex-auto '>
          <div className='text-left line-clamp-2'>{name?.trim() || '-'}</div>
        </div>
        <div className='flex-none flex flex-col justify-between items-end'>
          <div className='text-accent ml-6'>
            ¥ {price ? price.toFixed(2) : '-'}
          </div>
          <div className='text-accent ml-auto'>
            {quantity ? `${quantity}件` : '-'}
          </div>
        </div>
      </div>
    </div>
  )
}
