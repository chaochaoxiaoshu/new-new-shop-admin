import { Button } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { GetDistributorsRes, getDistributors } from '@/api'
import { MyTable } from '@/components/my-table'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'

const LIST_KEY = 'distributors'

export const Route = createFileRoute(
  '/_protected/marketing/drp/userIndex/distributors'
)({
  beforeLoad: ({ search }) => ({
    distributorsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () => getDistributors({ ...search, is_promoter: 1, examine: 2 }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.distributorsQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('分销员列表')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, isFetching } = useQuery(context.distributorsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetDistributorsRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '客户手机号',
      dataIndex: 'mobile',
      width: TableCellWidth.mobile,
      align: 'center'
    },
    {
      title: '客户昵称',
      dataIndex: 'nickname',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '签约状态',
      render: (_, item) => item.sign_status || '-',
      width: 120,
      align: 'center'
    },
    {
      title: '上级分销员昵称',
      render: (_, item) => item.distributor_nickname || '-',
      width: 148,
      align: 'center'
    },
    {
      title: '上级分销员手机号',
      render: (_, item) => item.distributor_mobile || '-',
      width: TableCellWidth.mobile + 20,
      align: 'center'
    },
    {
      title: '邀请分销员量',
      render: (_, item) => item.distributor_num ?? '-',
      width: TableCellWidth.count + 20,
      align: 'center'
    },
    {
      title: '绑定客户量',
      dataIndex: 'customer_num',
      width: TableCellWidth.count + 20,
      align: 'center'
    },
    {
      title: '推广订单数',
      dataIndex: 'order_num',
      width: TableCellWidth.count + 20,
      align: 'center'
    },
    {
      title: '推广订单总额',
      dataIndex: 'order_money',
      width: TableCellWidth.amountS + 20,
      align: 'center'
    },
    {
      title: '累计获取佣金',
      dataIndex: 'commission',
      width: TableCellWidth.amountS + 20,
      align: 'center'
    },
    {
      title: '已结算佣金',
      dataIndex: 'set_commission',
      width: TableCellWidth.amountS + 20,
      align: 'center'
    },
    {
      title: '签约周期',
      render: (_, item) =>
        item.sign_time && item.sign_end_time
          ? `${formatDateTime(item.sign_time)} - ${formatDateTime(
              item.sign_end_time
            )}`
          : '-',
      width: TableCellWidth.dateRange,
      align: 'center'
    },
    {
      title: '签约协议',
      render: (_, item) =>
        item.agreement !== 0 ? <Button type='text'>查看</Button> : '-',
      width: 120,
      align: 'center'
    },
    {
      title: '申请分销员时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Button type='text'>修改上级分销员</Button>
          <Button type='text'>删除分销员</Button>
        </div>
      ),
      width: 240,
      fixed: 'right',
      align: 'center'
    }
  ])

  return (
    <MyTable
      rowKey='id'
      data={data?.items ?? []}
      loading={isFetching}
      columns={columns}
      scroll={{ x: totalWidth + 128 }}
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
