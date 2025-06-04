import { useEffect } from 'react'

import { Notification } from '@arco-design/web-react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getActionPermission } from '@/api'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useUserStore } from '@/stores'

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ location }) => {
    if (!useUserStore.getState().isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href.replace('/newmanage', '') },
        replace: true
      })
    }
  },
  component: ProtectedView
})

function ProtectedView() {
  const updateActionPermission = async () => {
    try {
      const res = await getActionPermission()
      useUserStore.getState().setActionButtonList(res.items ?? [])
    } catch (error) {
      console.error(error)
      Notification.error({
        content: '获取按钮权限时发生错误'
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
        <div className='flex-auto max-h-[calc(100vh-60px)] overflow-y-auto'>
          <div className='flex flex-col p-4 min-h-full'>
            {/* TODO: 面包蟹 */}
            <div className='flex-auto flex flex-col h-full'>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
