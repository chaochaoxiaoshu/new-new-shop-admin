import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'

export function RouterProgressBar() {
  const router = useRouter()
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    const unsubscribeBeforeNavigate = router.subscribe(
      'onBeforeNavigate',
      ({ fromLocation, toLocation }) => {
        if (fromLocation?.pathname === toLocation.pathname) return
        ref.current?.staticStart()
      }
    )
    const unsubscribeLoad = router.subscribe(
      'onLoad',
      ({ fromLocation, toLocation }) => {
        if (fromLocation?.pathname === toLocation.pathname) return
        ref.current?.complete()
      }
    )

    return () => {
      unsubscribeBeforeNavigate()
      unsubscribeLoad()
    }
  }, [router])

  return <LoadingBar ref={ref} color='var(--accent)' shadow waitingTime={200} />
}
