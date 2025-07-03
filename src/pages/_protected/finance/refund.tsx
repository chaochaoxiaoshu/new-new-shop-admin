import { Button, Input, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { FileText, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetRefundListRes, getRefundList } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatAmount,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'refund-list'

export const Route = createFileRoute('/_protected/finance/refund')({
  validateSearch: type({
    'refund_id?': 'string',
    'source_id?': 'string',
    'status?': 'number',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    refundListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getRefundList({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.refundListQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('退款单')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const checkActionPermission = useUserStore(
    (state) => state.checkActionPermission
  )

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.refundListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetRefundListRes>([
    {
      title: '退货单号',
      dataIndex: 'refund_id',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '单号',
      dataIndex: 'source_id',
      width: 220,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '用户',
      dataIndex: 'user_tel',
      width: 140,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '退款金额',
      render: (_, item) => formatAmount(item.money),
      width: TableCellWidth.amountS,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '说明',
      render: (_, item) => item.new_memo || '-',
      width: 220,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '退款方式',
      render: (_, item) => item.payment_code || '-',
      width: 120,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '状态',
      render: (_, item) => {
        switch (item.status) {
          case 1:
            return '未退款'
          case 2:
            return '已退款'
          case 3:
            return '退款失败'
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
      title: '类型',
      render: (_, item) => {
        switch (item.type) {
          case 1:
            return '订单'
          case 2:
            return '充值'
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
      title: '创建时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '更新时间',
      render: (_, item) => formatDateTime(item.tkctime),
      width: TableCellWidth.datetime,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Button type='text'>明细</Button>
          <Show
            when={
              item.status !== 2 && checkActionPermission('/finance/refund/info')
            }
          >
            <Button type='text'>退款</Button>
          </Show>
        </div>
      ),
      width: 120,
      fixed: 'right',
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
            name='refund_id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入退货单号'
                style={{ width: 264 }}
                suffix={<FileText className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='source_id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入单号'
                style={{ width: 264 }}
                suffix={<FileText className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择状态'
                style={{ width: 264 }}
              >
                <Select.Option value={1}>未退款</Select.Option>
                <Select.Option value={2}>已退款</Select.Option>
                <Select.Option value={3}>退款失败</Select.Option>
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
        rowKey='refund_id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 180 }}
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
