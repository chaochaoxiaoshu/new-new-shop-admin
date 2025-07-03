import { Button, Input, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { FileText, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetPaymentListRes, getPaymentList } from '@/api'
import { MyTable } from '@/components/my-table'
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

const LIST_KEY = 'payment-list'

export const Route = createFileRoute('/_protected/finance/payment')({
  validateSearch: type({
    'payment_id?': 'string',
    'status?': 'number',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    paymentListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getPaymentList({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.paymentListQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('支付单')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.paymentListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetPaymentListRes>([
    {
      title: '支付单号',
      dataIndex: 'payment_id',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '支付对象',
      dataIndex: 'source_id',
      width: 220,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '状态',
      render: (_, item) => {
        switch (item.status) {
          case 1:
            return '未支付'
          case 2:
            return '已支付'
          case 3:
            return '其他'
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
      title: '支付方式',
      render: (_, item) =>
        item.payment_code == 'balancepay' ? '余额支付' : '微信支付',
      width: 120,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '单据类型',
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
      title: '用户',
      dataIndex: 'user_tel',
      width: 140,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '金额',
      render: (_, item) => formatAmount(item.money),
      width: TableCellWidth.amountS,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '第三方支付单号',
      dataIndex: 'trade_no',
      width: 320,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '支付时间',
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
            name='payment_id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入支付单号'
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
                <Select.Option value={1}>未支付</Select.Option>
                <Select.Option value={2}>已支付</Select.Option>
                <Select.Option value={3}>其他</Select.Option>
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
        rowKey='payment_id'
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
