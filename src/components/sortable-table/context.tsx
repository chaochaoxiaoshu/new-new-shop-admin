import { createContext, useContext } from 'react'

// biome-ignore lint/suspicious/noExplicitAny: false positive
export const DndListenersContext = createContext<any>(null)

export function useDndListeners() {
  return useContext(DndListenersContext)
}
