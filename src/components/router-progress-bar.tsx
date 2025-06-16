import { useEffect, useRef } from 'react'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'

import { useRouter } from '@tanstack/react-router'

export function RouterProgressBar() {
  const router = useRouter()
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    const handleBeforeNavigate = () => {
      ref.current?.staticStart()
    }

    const handleLoad = () => {
      ref.current?.complete()
    }

    const unsubscribeBeforeNavigate = router.subscribe(
      'onBeforeNavigate',
      handleBeforeNavigate
    )
    const unsubscribeLoad = router.subscribe('onLoad', handleLoad)

    return () => {
      unsubscribeBeforeNavigate()
      unsubscribeLoad()
    }
  }, [router])

  return <LoadingBar ref={ref} color='var(--accent)' shadow waitingTime={200} />
}
