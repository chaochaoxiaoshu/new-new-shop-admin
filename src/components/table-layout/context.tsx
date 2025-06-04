import { createContext, useContext } from 'react'

export const TableSizeContext = createContext<{ height: number }>({ height: 600 })

export const useTableSizeContext = () => {
  return useContext(TableSizeContext)
}
