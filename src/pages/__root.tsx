import { Button, ConfigProvider } from '@arco-design/web-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { RouterProgressBar } from '@/components/router-progress-bar'
import { queryClient } from '@/lib'

export const Route = createRootRoute({
  component: () => (
    <>
      <RouterProgressBar />
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          componentConfig={{
            Input: {
              allowClear: true
            },
            Select: {
              allowClear: true
            },
            Table: {
              borderCell: true
            }
          }}
          tablePagination={{ hideOnSinglePage: true }}
        >
          <Outlet />
        </ConfigProvider>
        <TanStackRouterDevtools position='bottom-left' />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  ),
  notFoundComponent: () => (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='text-7xl font-bold'>404</div>
      <div className='text-base mt-2'>页面不存在</div>
      <Link to='/' className='mt-6'>
        <Button type='primary'>返回首页</Button>
      </Link>
    </div>
  )
})
