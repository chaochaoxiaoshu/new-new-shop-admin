interface BaseLayoutProps {
  children?: React.ReactNode
}

export function BaseLayout(props: BaseLayoutProps) {
  const { children } = props

  return (
    <div className='flex-auto flex flex-col h-full px-4 py-6 min-w-[720px] rounded-md bg-white'>
      {children}
    </div>
  )
}
