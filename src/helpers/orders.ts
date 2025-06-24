export function getPayStatusText(pay_status?: number) {
  switch (pay_status) {
    case 1:
      return '未付款'
    case 2:
      return '已付款'
    case 3:
      return '部分付款'
    case 4:
      return '部分退款'
    case 5:
      return '已退款'
    default:
      return '-'
  }
}

export function getShipStatusText(ship_status?: number) {
  switch (ship_status) {
    case 1:
      return '未发货'
    case 2:
      return '部分发货'
    case 3:
      return '已发货'
    case 4:
      return '部分退货'
    case 5:
      return '已退货'
    default:
      return '-'
  }
}

export function getAfterSalesStatusText(after_sales_status?: number) {
  switch (after_sales_status) {
    case 1:
      return '未审核'
    case 2:
      return '审核通过'
    case 3:
      return '审核拒绝'
    default:
      return '-'
  }
}

export function getAfterSalesTypeText(after_sales_type?: number) {
  switch (after_sales_type) {
    case 1:
      return '未发货'
    case 2:
      return '已发货'
    default:
      return '-'
  }
}
