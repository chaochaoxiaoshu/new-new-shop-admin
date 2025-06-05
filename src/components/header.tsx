import { ChevronDownIcon, UserIcon } from 'lucide-react'

import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  Notification
} from '@arco-design/web-react'
import { useNavigate } from '@tanstack/react-router'

import logo from '@/assets/logo.png'
import { useUserStore } from '@/stores'

export function Header() {
  const username = useUserStore((store) => store.username)
  const navigate = useNavigate()

  const handleExit = () => {
    useUserStore.getState().logout()
    navigate({
      to: '/login',
      search: { redirect: '/' }
    })
    Notification.success({ content: '退出成功' })
  }

  return (
    <header className='flex items-center h-[60px] pl-6 pr-2 border-b bg-background'>
      <img src={logo} alt='logo' className='w-32' />
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
