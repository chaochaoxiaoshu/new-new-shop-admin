import { Button, Input } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetGiveawayListRes, getGiveawayList } from '@/api'
import { GoodsInfo } from '@/components/goods-info'
import { MyDatePicker } from '@/components/my-date-picker'
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

const LIST_KEY = 'giveaway-list'

export const Route = createFileRoute('/_protected/statistics/giveaway')({
  validateSearch: type({
    'order_id?': 'string',
    'range?': ['number', 'number'],
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    giveawayListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getGiveawayList({
          ...search,
          start_time: search.range?.[0],
          end_time: search.range?.[1],
          p_status: 3,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.giveawayListQueryOptions)
  },
  component: RouteComponent,
  head: () => getHead('分佣失败统计')
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const departmentId = useUserStore((store) => store.departmentId)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.giveawayListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetGiveawayListRes>([
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 220,
      align: 'center'
    },
    {
      title: '下单时间',
      render: (_, item) => formatDateTime(item.order_info?.ctime),
      width: 200,
      align: 'center'
    },
    {
      title: '订单总额',
      render: (_, item) => formatAmount(item.order_info?.payed),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '订单状态',
      render: (_, item) => item.order_info?.status_order_text || '-',
      width: 120,
      align: 'center'
    },
    {
      title: '商品信息',
      render: (_, item) => (
        <div className='flex flex-col space-y-2 my-2'>
          {item.order_items?.map((item) => (
            <GoodsInfo
              key={item.id}
              name={item.name}
              imageUrl={item.image_url}
            />
          ))}
        </div>
      ),
      width: 450,
      align: 'center'
    },
    {
      title: '分销员奖励',
      children: [
        {
          title: '应分佣金额',
          render: (_, item) =>
            item.order_items?.map((item) =>
              item.commission ? formatAmount(item.commission) : '-'
            ),
          width: TableCellWidth.amountS,
          align: 'center'
        },
        {
          title: '实际分佣金额',
          render: () => '0',
          width: TableCellWidth.amountS,
          align: 'center'
        }
      ],
      align: 'center'
    },
    {
      title: '上级分销员奖励',
      children: [
        {
          title: '应分佣金额',
          render: (_, item) =>
            item.order_items?.map((item) =>
              item.secondary_commission
                ? formatAmount(item.secondary_commission)
                : '-'
            ),
          width: TableCellWidth.amountS,
          align: 'center'
        },
        {
          title: '实际分佣金额',
          render: () => '0',
          width: TableCellWidth.amountS,
          align: 'center'
        }
      ],
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) =>
        item.order_items?.map((item) => (
          <div className='actions'>
            <Show
              when={
                item.is_gift !== 1 &&
                item.handle === 1 &&
                departmentId !== 0 &&
                item.profitsharing_status === 3
              }
              fallback={
                <Show when={item.handle === 2}>
                  <Button>查看备注信息</Button>
                </Show>
              }
            >
              <Button type='text'>备注</Button>
            </Show>
          </div>
        )),
      width: 150,
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
            name='order_id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入订单号'
                style={{ width: 264 }}
                suffix={<Search className='inline size-4' />}
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
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 220 }}
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
