import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  GetGoodsDimensionStatisticsRes,
  getGoodsDimensionStatistics
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

const LIST_KEY = 'goods-dimension-list'

export const Route = createFileRoute(
  '/_protected/statistics/old-distribution/goods-dimension'
)({
  beforeLoad: ({ search }) => ({
    GoodsDimensionQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getGoodsDimensionStatistics({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.GoodsDimensionQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('商品维度统计')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, isFetching } = useQuery(context.GoodsDimensionQueryOptions)

  const { columns, totalWidth } =
    defineTableColumns<GetGoodsDimensionStatisticsRes>([
      {
        title: '订单号',
        dataIndex: 'order_id',
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '商品名称',
        dataIndex: 'goods_name',
        width: 400,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '商品规格',
        dataIndex: 'product_name',
        width: 400,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '数量',
        dataIndex: 'goods_nums',
        width: TableCellWidth.count,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '订单状态',
        dataIndex: 'order_status_str',
        width: 120,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '推广方式',
        render: (_, item) => {
          return item.share_method === 1 ? '分销' : '非分销'
        },
        width: 120,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '买家付款时间',
        render: (_, item) => formatDateTime(item.pay_time),
        width: 180,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '商品金额合计',
        render: (_, item) => formatAmount(item.pay_amount),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '运费',
        render: (_, item) => formatAmount(item.freight),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '店铺优惠合计',
        render: (_, item) => formatAmount(item.discount_amount),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '商品实付金额',
        render: (_, item) => formatAmount(item.pay_amount),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '退款金额',
        render: (_, item) => formatAmount(item.refund_amount),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '退款运费',
        render: (_, item) => formatAmount(item.refund_freight),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '退款时间',
        render: (_, item) => formatDateTime(item.refund_time),
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '商家备注',
        dataIndex: 'mark',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '售后类型',
        dataIndex: 'aftersales_type',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '售后状态',
        dataIndex: 'aftersales_status_str',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '售后件数',
        dataIndex: 'aftersales_nums',
        width: TableCellWidth.count,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '收货人',
        dataIndex: 'ship_name',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '收货人手机号',
        dataIndex: 'ship_mobile',
        width: TableCellWidth.mobile,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '收货地址',
        dataIndex: 'ship_address',
        width: 300,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '买家手机号',
        dataIndex: 'buy_mobile',
        width: TableCellWidth.mobile,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '买家姓名',
        dataIndex: 'buy_name',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '分销员ID',
        dataIndex: 'p_user_id',
        width: TableCellWidth.id,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '分销员手机号',
        dataIndex: 'p_mobile',
        width: TableCellWidth.mobile,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '分销员姓名',
        dataIndex: 'p_name',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '分销员公司/部门',
        dataIndex: 'p_company',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '上级分销员手机号',
        dataIndex: 'sp_mobile',
        width: TableCellWidth.mobile,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '上级分销员姓名',
        dataIndex: 'sp_name',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '上级分销员公司/部门',
        dataIndex: 'sp_company',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '营销活动',
        dataIndex: 'activity_name',
        width: 200,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '发货方式',
        render: (_, item) => (item.delivery === 1 ? '快递邮寄' : '门店自提'),
        width: 120,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '物流状态',
        dataIndex: 'ship_status_str',
        width: 150,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '配送单号',
        dataIndex: 'logi_no',
        width: 150,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '提货码',
        dataIndex: 'bill_lading_id',
        width: 150,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '订单佣金金额',
        render: (_, item) => formatAmount(item.commission_amount),
        width: TableCellWidth.amountS,
        align: 'center',
        ellipsis: true,
        tooltip: true
      },
      {
        title: '订单备注',
        dataIndex: 'memo',
        width: 150,
        align: 'center',
        ellipsis: true,
        tooltip: true
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
