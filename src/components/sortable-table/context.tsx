import { createContext, useContext } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DndListenersContext = createContext<any>(null)

export function useDndListeners() {
  return useContext(DndListenersContext)
}
