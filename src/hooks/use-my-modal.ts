import useModal from '@arco-design/web-react/es/Modal/useModal'

/**
 * 二次封装 useModal 钩子，提供默认配置
 */
export function useMyModal() {
  const [modal, contextHolder] = useModal()

  const openModal = (
    options: Parameters<NonNullable<typeof modal.info>>[0]
  ) => {
    return modal.info?.({
      ...options,
      autoFocus: false,
      closable: true,
      footer: null,
      simple: false,
      unmountOnExit: true
    })
  }

  return [openModal, contextHolder] as const
}
