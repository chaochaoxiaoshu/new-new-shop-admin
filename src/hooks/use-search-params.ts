import { useState } from 'react'

interface UseSearchParamsOptions<T> {
  default: T
}

export function useSearchParams<T>(options: UseSearchParamsOptions<T>) {
  const { default: defaultParams } = options

  const [params, setParams] = useState(defaultParams)
  const [savedParams, setSavedParams] = useState<T>()

  const search = () => {
    setSavedParams(params)
  }

  const reset = () => {
    setParams(defaultParams)
    setSavedParams(defaultParams)
  }

  return {
    params,
    savedParams,
    search,
    reset
  }
}
