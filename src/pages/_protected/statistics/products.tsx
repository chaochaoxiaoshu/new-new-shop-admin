import { Button, DatePicker } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import dayjs from 'dayjs'
import { RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetProductsStatisticsRes, getProductsStatistics } from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import { defineTableColumns, formatAmount, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'products-statistics'

export const Route = createFileRoute('/_protected/statistics/products')({
  validateSearch: type({
    'range?': ['string', 'string'],
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => {
    return {
      productsStatisticsQueryOptions: queryOptions({
        queryKey: [LIST_KEY, search],
        queryFn: () =>
          getProductsStatistics({
            ...search,
            start: search.range?.[0] ?? dayjs().format('YYYY-MM-DD'),
            end: search.range?.[1] ?? dayjs().format('YYYY-MM-DD'),
            department_id: useUserStore.getState().departmentId!
          }),
        placeholderData: keepPreviousData
      })
    }
  },
  component: RouteComponent,
  head: () => getHead('商品统计')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      ...search,
      range: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')] as [
        string,
        string
      ]
    }
  })

  const { data, isFetching } = useQuery(context.productsStatisticsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetProductsStatisticsRes>([
    {
      title: '商品名称',
      dataIndex: 'goods_name',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '规格',
      dataIndex: 'product_name',
      width: 200,
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '销量',
      dataIndex: 'sale_nums',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '销售额',
      render: (_, item) => formatAmount(item.sale_amount),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '退货量',
      dataIndex: 'refund_nums',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '浏览量',
      dataIndex: 'view_nums',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '退款金额',
      render: (_, item) => formatAmount(item.refund_amount),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '已结算佣金',
      render: (_, item) => formatAmount(item.settle_amount),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '未结算佣金',
      render: (_, item) => formatAmount(item.no_settle_amount),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '自提商品销量',
      dataIndex: 'take_nums',
      width: TableCellWidth.count + 30,
      align: 'center'
    },
    {
      title: '自提已核销商品销量',
      dataIndex: 'verify_take_nums',
      width: TableCellWidth.count + 60,
      align: 'center'
    },
    {
      title: '所属事业部',
      dataIndex: 'department_name',
      width: 150,
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '货号',
      dataIndex: 'sn',
      width: 200,
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
            name='range'
            render={({ field }) => (
              <DatePicker.RangePicker {...field} style={{ width: 264 }} />
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
        rowKey='sn'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 340 }}
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
