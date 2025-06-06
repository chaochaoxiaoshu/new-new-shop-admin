import { AnyRouteMatch } from '@tanstack/react-router'

import { useUserStore } from '@/stores'

export function getHead(
  name: string,
  others?: {
    meta?: AnyRouteMatch['meta']
    links?: AnyRouteMatch['links']
    scripts?: AnyRouteMatch['headScripts']
  }
) {
  const shopname = useUserStore.getState().platformInfo?.items?.shop_name
  return {
    meta: [
      { title: shopname ? `${shopname} - ${name}` : name },
      ...(others?.meta || [])
    ],
    links: others?.links,
    scripts: others?.scripts
  }
}
