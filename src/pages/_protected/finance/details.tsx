import { Button, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetBalanceListRes, getBalanceList } from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'balance-list'

export const Route = createFileRoute('/_protected/finance/details')({
  validateSearch: type({
    'type?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    balanceListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getBalanceList({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.balanceListQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('资金明细')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.balanceListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetBalanceListRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      fixed: 'left',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '用户',
      dataIndex: 'user_tel',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 220,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '类型',
      render: (_, item) => {
        switch (item.type) {
          case 1:
            return '消费'
          case 2:
            return '退款'
          case 3:
            return '充值'
          case 4:
            return '提现'
          case 5:
            return '佣金'
          case 7:
            return '平台调整'
          case 8:
            return '奖励'
          default:
            return '-'
        }
      },
      width: 120,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '金额',
      render: (_, item) => item.money ?? 0,
      width: TableCellWidth.amountS,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '余额',
      render: (_, item) => item.balance ?? 0,
      width: TableCellWidth.amountL,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '描述',
      render: (_, item) => item.memo || '-',
      width: 220,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    }
  ])

  return (
    <TableLayout
      header={
        <form
          className='table-header'
          onSubmit={handleSubmit((values) => navigate({ search: values }))}
          onReset={() => {
            reset()
            navigate({
              search: {
                page_index: search.page_index,
                page_size: search.page_size
              }
            })
          }}
        >
          <Controller
            control={control}
            name='type'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择类型'
                style={{ width: 264 }}
              >
                <Select.Option value={1}>消费</Select.Option>
                <Select.Option value={2}>退款</Select.Option>
                <Select.Option value={3}>充值</Select.Option>
                <Select.Option value={4}>提现</Select.Option>
                <Select.Option value={5}>佣金</Select.Option>
                <Select.Option value={6}>平台调整</Select.Option>
                <Select.Option value={7}>奖励</Select.Option>
              </Select>
            )}
          />
          <Button
            type='primary'
            htmlType='submit'
            icon={<Search className='inline size-4' />}
          >
            查询
          </Button>
          <Button
            type='outline'
            htmlType='reset'
            icon={<RotateCcw className='inline size-4' />}
          >
            重置
          </Button>
        </form>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 140 }}
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
    </TableLayout>
  )
}
