import { createContext, useContext } from 'react'

export const TableSizeContext = createContext<{ height?: number }>({})

export const useTableSizeContext = () => {
  return useContext(TableSizeContext)
}
