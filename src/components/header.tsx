import { Avatar, Button, Dropdown, Menu } from '@arco-design/web-react'
import { useUserStore } from '@/stores/user-store'
import { redirect } from '@tanstack/react-router'
import { ChevronDownIcon, UserIcon } from 'lucide-react'

export function Header() {
  const username = useUserStore((store) => store.username)

  const handleExit = () => {
    useUserStore.getState().logout()
    redirect({
      to: '/login',
      search: { redirect: location.href.replace('/newmanage', '') }
    })
  }

  return (
    <header className='flex items-center h-[60px] pl-6 pr-2 border-b bg-white'>
      <div className='flex items-center'>L</div>
      <div className='ml-auto'>
        <Dropdown
          trigger='click'
          position='br'
          droplist={
            <Menu>
              <Menu.Item key='exit' onClick={handleExit}>
                退出登录
              </Menu.Item>
            </Menu>
          }
        >
          <Button type='text' style={{ height: 60, color: 'var(--fg)' }}>
            <div className='flex items-center space-x-3'>
              <Avatar size={32}>
                <UserIcon className='size-4' />
              </Avatar>
              <span className='text-sm font-medium'>{username}</span>
              <ChevronDownIcon className='size-4' />
            </div>
          </Button>
        </Dropdown>
      </div>
    </header>
  )
}
