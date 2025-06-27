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

const LIST_KEY = 'distributor-approval'

export const Route = createFileRoute(
  '/_protected/marketing/drp/userIndex/approval'
)({
  beforeLoad: ({ search }) => ({
    approvalQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () => getDistributors({ ...search, is_promoter: 0 }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.approvalQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('分销员审核')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, isFetching } = useQuery(context.approvalQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetDistributorsRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '分销员昵称',
      dataIndex: 'nickname',
      align: 'center'
    },
    {
      title: '分销员手机号',
      dataIndex: 'mobile',
      width: TableCellWidth.mobile,
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
      title: '状态',
      render: (_, item) => {
        switch (item.examine) {
          case 1:
            return '审核中'
          case 2:
            return '审核通过'
          case 3:
            return '审核拒绝'
          default:
            return '-'
        }
      },
      width: 120,
      align: 'center'
    },
    {
      title: '拒绝原因',
      render: (_, item) => item.reason || '-',
      width: 200,
      align: 'center'
    },
    {
      title: '邀请人',
      dataIndex: 'inviter',
      width: 128,
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
          <Button type='text'>通过</Button>
          <Button type='text'>拒绝</Button>
        </div>
      ),
      width: 120,
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
