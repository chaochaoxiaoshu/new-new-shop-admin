import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@arco-design/web-react/dist/css/arco.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import './index.css'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  basepath: '/newmanage',
  defaultPreload: 'intent',
  defaultStaleTime: 30_000
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
