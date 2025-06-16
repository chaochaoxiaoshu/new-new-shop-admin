import { cn } from '@/lib'

interface SectionTitleProps {
  className?: string
  children: React.ReactNode
}

export function SectionTitle(props: SectionTitleProps) {
  const { className, children } = props
  return (
    <div className={cn('flex space-x-3 items-center mt-6 mb-5', className)}>
      <div className='w-1 h-4 rounded-full bg-accent' />
      <h2 className='text-base leading-none font-semibold'>{children}</h2>
    </div>
  )
}
