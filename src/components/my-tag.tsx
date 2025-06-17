interface MyTagProps {
  text: string
}

export function MyTag(props: MyTagProps) {
  return (
    <span className='flex-none px-2 py-1 text-xs font-medium rounded-lg bg-background border border-gray-200 shadow-sm cursor-default'>
      {props.text}
    </span>
  )
}

interface MyTagGroupProps {
  children: React.ReactNode
}

MyTag.Group = function MyTagGroup(props: MyTagGroupProps) {
  return (
    <div className='group relative'>
      <div className='flex items-center space-x-1 overflow-hidden py-2'>
        {props.children}
      </div>
      <div className='group-hover:flex hidden absolute top-1/2 -translate-y-1/2 left-0 items-center space-x-1 py-2'>
        {props.children}
      </div>
    </div>
  )
}
