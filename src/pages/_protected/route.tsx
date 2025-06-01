import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useUserStore } from '@/stores/user-store'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { getActionPermission } from '@/api/common/get-action-permission'
import { useEffect } from 'react'
import { Notification } from '@arco-design/web-react'

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ location }) => {
    if (!useUserStore.getState().isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href.replace('/newmanage', '') },
        replace: true,
      })
    }
  },
  component: ProtectedView,
})

function ProtectedView() {
  const updateActionPermission = async () => {
    try {
      const res = await getActionPermission()
      useUserStore.getState().setActionButtonList(res.items ?? [])
    } catch (error) {
      console.error(error)
      Notification.error({
        content: '获取按钮权限时发生错误',
      })
    }
  }

  useEffect(() => {
    updateActionPermission()
  }, [])

  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <div className='flex-none'>
        <Header />
      </div>
      <div className='flex-auto flex max-h-[calc(100vh-60px)]'>
        <div className='flex-none overflow-y-auto'>
          <Sidebar />
        </div>
        <div className='flex-auto overflow-y-auto'>
          <div className='flex flex-col p-4'>
            <div className='flex-auto'>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
