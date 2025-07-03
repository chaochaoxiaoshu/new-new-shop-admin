import { Button, Input, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { FileText, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import {
  GetGoodsDimensionStatisticsRes,
  getGoodsDimensionStatistics
} from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
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

const LIST_KEY = 'distributionotc-list'

export const Route = createFileRoute('/_protected/statistics/distributionotc')({
  validateSearch: type({
    'order_id?': 'string',
    'p_mobile?': 'string',
    'range?': ['number', 'number'],
    'refund_range?': ['number', 'number'],
    'is_fenxiao?': 'number',
    'delivery?': 'number',
    'department_id?': 'number',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
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
  head: () => getHead('新分销统计-OTC')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.GoodsDimensionQueryOptions)

  const { columns, totalWidth } =
    defineTableColumns<GetGoodsDimensionStatisticsRes>([
      {
        title: '订单号',
        dataIndex: 'order_id',
        align: 'center',
        width: 220,
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
    <TableLayout
      header={
        <form
          className='table-header'
          onSubmit={handleSubmit((values) =>
            navigate({
              search: values
            })
          )}
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
            name='p_mobile'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入手机号'
                style={{ width: 264 }}
                suffix={<FileText className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='range'
            render={({ field }) => (
              <MyDatePicker.RangePicker {...field} style={{ width: 264 }} />
            )}
          />
          <Controller
            control={control}
            name='refund_range'
            render={({ field }) => (
              <MyDatePicker.RangePicker
                {...field}
                style={{ width: 264 }}
                placeholder={['退款开始日期', '退款结束日期']}
              />
            )}
          />
          <Controller
            control={control}
            name='is_fenxiao'
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: 264 }}
                placeholder='请选择是否分销'
              >
                <Select.Option value={1}>分销</Select.Option>
                <Select.Option value={2}>非分销</Select.Option>
              </Select>
            )}
          />
          <Controller
            control={control}
            name='delivery'
            render={({ field }) => (
              <Select
                {...field}
                style={{ width: 264 }}
                placeholder='请选择配送方式'
              >
                <Select.Option value={1}>快递邮寄</Select.Option>
                <Select.Option value={2}>门店自提</Select.Option>
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
        rowKey='order_id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 300 }}
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
