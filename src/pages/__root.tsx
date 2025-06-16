import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRoute } from '@tanstack/react-router'

import { RouterProgressBar } from '@/components/router-progress-bar'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { queryClient } from '@/lib'

export const Route = createRootRoute({
  component: () => (
    <>
      <RouterProgressBar />
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
      {/* <TanStackRouterDevtools position='top-left' /> */}
    </>
  )
})
