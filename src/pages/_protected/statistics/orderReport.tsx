import {
  Button,
  DatePicker,
  Input,
  Message,
  Select,
  Table
} from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import dayjs from 'dayjs'
import { FileText, RotateCcw, Search, Share } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import {
  GetMonthlySummaryReportRes,
  getDepartments,
  getMonthlySummaryReport,
  getMonthlySummaryStatistics
} from '@/api'
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

const LIST_KEY = 'monthly-report-list'

export const Route = createFileRoute('/_protected/statistics/orderReport')({
  validateSearch: type({
    'order_id?': 'string',
    'department?': 'number',
    'month?': 'string',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: () => ({
    departmentsQueryOptions: queryOptions({
      queryKey: ['departments'],
      queryFn: () =>
        getDepartments({
          pageIndex: 1,
          pageSize: 9999
        })
    })
  }),
  loader: ({ context }) => {
    queryClient.prefetchQuery(context.departmentsQueryOptions)
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

  const { data: departments } = useQuery(context.departmentsQueryOptions)

  const { data: statistics } = useQuery({
    queryKey: ['monthly-report-statistics', search],
    queryFn: () =>
      getMonthlySummaryStatistics({
        start_time: dayjs(search.month).startOf('month').unix(),
        end_time: dayjs(search.month).endOf('month').unix(),
        department: search.department ?? useUserStore.getState().departmentId!
      })
  })

  const { data, isFetching } = useQuery({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getMonthlySummaryReport({
        ...search,
        start_time: dayjs(search.month).startOf('month').unix(),
        end_time: dayjs(search.month).endOf('month').unix(),
        department: search.department ?? useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData,
    enabled: !!search.month
  })

  const { columns, totalWidth } =
    defineTableColumns<GetMonthlySummaryReportRes>([
      {
        title: 'ID',
        dataIndex: 'id',
        width: TableCellWidth.id,
        align: 'center'
      },
      {
        title: '订单号',
        dataIndex: 'order_id',
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
        title: '完成月份',
        render: (_, item) => formatDateTime(item.complete_time),
        width: TableCellWidth.datetime,
        align: 'center'
      },
      {
        title: '商品金额合计',
        render: (_, item) => formatAmount(Number(item.goods_amount)),
        width: TableCellWidth.amountL,
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
        width: TableCellWidth.amountL,
        align: 'center'
      },
      {
        title: '退款金额',
        render: (_, item) => formatAmount(Number(item.refund_money)),
        width: TableCellWidth.amountL,
        align: 'center'
      },
      {
        title: '全部商品名称',
        dataIndex: 'goods_name',
        width: 350,
        ellipsis: true,
        tooltip: true
      },
      {
        title: '商品种类数',
        dataIndex: 'goods_num',
        width: TableCellWidth.count + 10,
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
        width: TableCellWidth.amountL,
        align: 'center'
      }
    ])

  const summary = () => {
    return (
      <Table.Summary fixed='bottom'>
        <Table.Summary.Row>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>合计</div>
          </Table.Summary.Cell>
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {formatAmount(statistics?.total_amount)}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {formatAmount(statistics?.shipping_fee)}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {formatAmount(statistics?.total_discount)}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {formatAmount(statistics?.actual_payment)}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {formatAmount(statistics?.refund_amount)}
            </div>
          </Table.Summary.Cell>
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell />
          <Table.Summary.Cell>
            <div className='flex items-center justify-center'>
              {formatAmount(statistics?.order_commission)}
            </div>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    )
  }

  const handleExport = () => {
    if (!getValues('month')) {
      Message.warning({ content: '请先选择导出月份' })
      return
    }
    const url = generateExportUrl(
      '/jshop-report/api/v1/report-statistics/export',
      {
        start_time: dayjs(getValues('month')).startOf('month').unix(),
        end_time: dayjs(getValues('month')).endOf('month').unix(),
        department:
          getValues('department') ?? useUserStore.getState().departmentId!
      }
    )
    downloadFile(url)
  }

  return (
    <TableLayout
      header={
        <div className='flex flex-col space-y-4'>
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
              name='department'
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='请选择电商事业部'
                  style={{ width: '264px' }}
                >
                  {departments?.items.map((item) => (
                    <Select.Option key={item.id} value={item.id!}>
                      {item.department_name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
            <Controller
              control={control}
              name='month'
              render={({ field }) => (
                <DatePicker.MonthPicker {...field} style={{ width: 264 }} />
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
          <div className='text-red-500'>
            提示：每月 20 日生成上月订单数据，防止退货退款产生~
          </div>
        </div>
      }
    >
      <MyTable
        rowKey='order_id'
        data={data?.items ?? []}
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 240 }}
        summary={summary}
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
