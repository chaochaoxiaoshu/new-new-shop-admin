import { Button, Input, Message, Table } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { FileText, RotateCcw, Search, Share } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetMonthlyReportRes, getMonthlyReport } from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { downloadFile, generateExportUrl, getHead } from '@/helpers'
import {
  defineTableColumns,
  formatAmount,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'monthly-report'

export const Route = createFileRoute('/_protected/finance/monthly')({
  validateSearch: type({
    'order_id?': 'string',
    'range?': ['number', 'number'],
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    monthlyReportQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getMonthlyReport({
          ...search,
          start_time: search.range?.[0],
          end_time: search.range?.[1],
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.monthlyReportQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('月度统计报表')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, getValues, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.monthlyReportQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetMonthlyReportRes>([
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 220,
      align: 'center'
    },
    {
      title: '订单状态',
      dataIndex: 'status_order_text',
      width: 120,
      align: 'center'
    },
    {
      title: '推广方式',
      dataIndex: 'methods',
      width: 120,
      align: 'center'
    },
    {
      title: '买家付款时间',
      render: (_, item) => formatDateTime(item.payment_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '商品金额合计',
      render: (_, item) => formatAmount(Number(item.goods_amount)),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '运费',
      render: (_, item) => formatAmount(Number(item.cost_freight)),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '店铺优惠合计',
      render: (_, item) => formatAmount(Number(item.totalAmount)),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '订单实付金额',
      render: (_, item) => formatAmount(Number(item.payed)),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '退款金额',
      render: (_, item) => formatAmount(Number(item.refund_money)),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '全部商品名称',
      dataIndex: 'goods_name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '商品种类数',
      dataIndex: 'goods_num',
      width: TableCellWidth.count + 20,
      align: 'center'
    },
    {
      title: '发货方式',
      dataIndex: 'delivery_name',
      width: 120,
      align: 'center'
    },
    {
      title: '订单佣金金额',
      render: (_, item) => formatAmount(Number(item.commission_amount)),
      width: TableCellWidth.amountS,
      align: 'center'
    }
  ])

  const summary = (currentData: GetMonthlyReportRes[]) => {
    return (
      <Table.Summary fixed='bottom'>
        <Table.Summary.Row>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>合计</div>
          </Table.Summary.Cell>
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {`¥ ${currentData
                .reduce((total, item) => total + Number(item.goods_amount), 0)
                .toFixed(2)}`}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {`¥ ${currentData
                .reduce((total, item) => total + Number(item.cost_freight), 0)
                .toFixed(2)}`}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {`¥ ${currentData
                .reduce((total, item) => total + Number(item.totalAmount), 0)
                .toFixed(2)}`}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {`¥ ${currentData
                .reduce((total, item) => total + Number(item.payed), 0)
                .toFixed(2)}`}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {`¥ ${currentData
                .reduce((total, item) => total + Number(item.refund_money), 0)
                .toFixed(2)}`}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
        </Table.Summary.Row>
      </Table.Summary>
    )
  }

  const handleExport = () => {
    if (!getValues('range')) {
      Message.warning({ content: '请先选择导出时间范围' })
      return
    }
    const url = generateExportUrl(
      '/jshop-report/api/v1/report-statistics/export',
      {
        start_time: getValues('range')?.[0],
        end_time: getValues('range')?.[1]
      }
    )
    downloadFile(url)
  }

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
            name='order_id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入订单号'
                style={{ width: 264 }}
                suffix={<FileText className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='range'
            render={({ field }) => (
              <MyDatePicker.RangePicker
                {...field}
                placeholder={['开始时间', '结束时间']}
                style={{ width: 264 }}
              />
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
          <Button
            type='outline'
            icon={<Share className='inline size-4' />}
            onClick={handleExport}
          >
            导出
          </Button>
        </form>
      }
    >
      <MyTable
        rowKey='order_id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 320 }}
        summary={(currentData) => summary(currentData as GetMonthlyReportRes[])}
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
