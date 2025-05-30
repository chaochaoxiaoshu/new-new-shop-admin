import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useUserStore } from '@/stores/user-store'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

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
  component: RouteComponent,
})

function RouteComponent() {
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
