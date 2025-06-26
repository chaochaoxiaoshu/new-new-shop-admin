import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import '@arco-design/web-react/dist/css/arco.css'
import './index.css'

const router = createRouter({
  routeTree,
  basepath: '/newmanage',
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultStaleTime: Infinity
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
