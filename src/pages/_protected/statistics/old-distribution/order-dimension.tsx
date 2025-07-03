import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  GetOrderDimensionStatisticsRes,
  getOrderDimensionStatistics
} from '@/api'
import { MyTable } from '@/components/my-table'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatAmount,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'order-dimension-list'

export const Route = createFileRoute(
  '/_protected/statistics/old-distribution/order-dimension'
)({
  beforeLoad: ({ search }) => ({
    orderDimensionQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getOrderDimensionStatistics({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.orderDimensionQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('订单维度统计')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, isFetching } = useQuery(context.orderDimensionQueryOptions)

  const { columns, totalWidth } =
    defineTableColumns<GetOrderDimensionStatisticsRes>([
      {
        title: '订单号',
        dataIndex: 'order_id',
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '订单状态',
        dataIndex: 'order_status_str',
        width: 120,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '推广方式',
        render: (_, item) => (item.share_method === 1 ? '分销' : '非分销'),
        width: 120,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '事业部名称',
        dataIndex: 'department_name',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '买家付款时间',
        render: (_, item) => formatDateTime(item.pay_time),
        width: TableCellWidth.datetime,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '商品金额总计',
        render: (_, item) => formatAmount(item.total_amount),
        width: TableCellWidth.amountS,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '运费',
        render: (_, item) => formatAmount(item.freight),
        width: TableCellWidth.amountS,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '店铺优惠合计',
        render: (_, item) => formatAmount(item.discount_amount),
        width: TableCellWidth.amountS,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '订单实付金额',
        render: (_, item) => formatAmount(item.pay_amount),
        width: TableCellWidth.amountS,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '退款金额',
        render: (_, item) => formatAmount(item.refund_amount),
        width: TableCellWidth.amountS,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '全部商品名称',
        dataIndex: 'goods_name',
        width: 380,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '商品种类数',
        dataIndex: 'goods_nums',
        width: TableCellWidth.count + 20,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '收货人',
        dataIndex: 'ship_name',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '收货人手机号',
        dataIndex: 'ship_mobile',
        width: TableCellWidth.mobile,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '收货地址',
        dataIndex: 'ship_address',
        width: 250,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '买家手机号',
        dataIndex: 'buy_mobile',
        width: TableCellWidth.mobile,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '买家姓名',
        dataIndex: 'buy_name',
        width: 200,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '分销员ID',
        dataIndex: 'p_user_id',
        width: TableCellWidth.id,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '分销员手机号',
        dataIndex: 'p_mobile',
        width: TableCellWidth.mobile,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '分销员姓名',
        dataIndex: 'p_name',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '分销员公司/部门',
        dataIndex: 'p_company',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '上级分销员手机号',
        dataIndex: 'sp_mobile',
        width: TableCellWidth.mobile + 20,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '上级分销员姓名',
        dataIndex: 'sp_name',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '上级分销员公司/部门',
        dataIndex: 'sp_company',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '营销活动',
        dataIndex: 'activity_name',
        width: 180,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '发货方式',
        render: (_, item) =>
          item.delivery === 1
            ? '快递邮寄'
            : item.delivery === 2
            ? '门店自提'
            : '-',
        width: 120,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      },
      {
        title: '订单佣金金额',
        render: (_, item) => formatAmount(item.commission_amount),
        width: TableCellWidth.amountS,
        ellipsis: true,
        tooltip: true,
        align: 'center'
      }
    ])

  return (
    <MyTable
      rowKey='order_id'
      data={data?.items ?? []}
      loading={isFetching}
      columns={columns}
      scroll={{ x: totalWidth + 220 }}
      pagination={{
        current: data?.paginate.page_index,
        pageSize: data?.paginate.page_size,
        total: data?.paginate.total,
        onChange: (current, pageSize) => {
          navigate({
            search: {
              ...search,
              page_index: current,
              page_size: pageSize
            }
          })
        }
      }}
    />
  )
}
