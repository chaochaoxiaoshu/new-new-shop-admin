import { Button, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetWithdrawalListRes, getWithdrawalList } from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'

const LIST_KEY = 'withdrawal-list'

export const Route = createFileRoute('/_protected/finance/application')({
  validateSearch: type({
    'type?': '1 | 2 | 3 | 4',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    withdrawalListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () => getWithdrawalList(search),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.withdrawalListQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('提现申请')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.withdrawalListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetWithdrawalListRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      ellipsis: true,
      tooltip: true,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '用户',
      render: (_, item) => item.user_name || '-',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '手机号',
      render: (_, item) => item.user_tel || '-',
      width: TableCellWidth.mobile,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '金额',
      render: (_, item) => item.money || '-',
      width: TableCellWidth.amountS,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '手续费',
      render: (_, item) => item.withdrawals || '-',
      width: TableCellWidth.amountS,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '类型',
      render: (_, item) => {
        switch (item.type) {
          case 1:
            return '待审核'
          case 2:
            return '提现成功'
          case 3:
            return '提现失败'
          case 4:
            return '提现处理中'
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
      title: '微信明细单号',
      render: (_, item) => item.out_batch_no || '-',
      width: 200,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '失败原因',
      render: (_, item) => item.error_massage || '-',
      width: 200,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '创建时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '更新时间',
      render: (_, item) => formatDateTime(item.utime),
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
                <Select.Option value={1}>待审核</Select.Option>
                <Select.Option value={2}>提现成功</Select.Option>
                <Select.Option value={3}>提现失败</Select.Option>
                <Select.Option value={4}>提现处理中</Select.Option>
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
    </TableLayout>
  )
}
