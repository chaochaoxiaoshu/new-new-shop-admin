import {
  createFileRoute,
  HeadContent,
  Outlet,
  redirect
} from '@tanstack/react-router'

import { MyBreadcrumb } from '@/components/breadcrumb'
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
  return (
    <>
      <HeadContent />
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
              <div className='flex-none h-6 mb-4'>
                <MyBreadcrumb />
              </div>
              <div className='flex-auto flex flex-col h-full'>
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
