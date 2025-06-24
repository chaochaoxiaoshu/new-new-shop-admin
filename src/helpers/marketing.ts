import { UserCouponIsUse } from '@/api'

export function getUserCouponIsUseText(isUse?: UserCouponIsUse) {
  switch (isUse) {
    case UserCouponIsUse.已使用:
      return '已使用'
    case UserCouponIsUse.未使用:
      return '未使用'
    case UserCouponIsUse.停止使用:
      return '停止使用'
    default:
      return '-'
  }
}
