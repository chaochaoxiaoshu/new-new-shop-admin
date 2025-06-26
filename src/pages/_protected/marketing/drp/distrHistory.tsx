import { Button, Input, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetDrpListRes, getDrpList } from '@/api'
import { MyImage } from '@/components/my-image'
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

const LIST_KEY = 'distr-history-list'

export const Route = createFileRoute('/_protected/marketing/drp/distrHistory')({
  validateSearch: type({
    'goods_name?': 'string',
    'is_custom?': '1 | 2',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    distrListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getDrpList({
          ...search,
          department: useUserStore.getState().departmentId!,
          status: 2
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.distrListQueryOptions)
  },
  component: DistrHistoryView,
  head: () => getHead('分销历史列表')
})

function DistrHistoryView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.distrListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetDrpListRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '缩略图',
      render: (_, item) => <MyImage src={item.image} width={40} height={40} />,
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '商品名称',
      dataIndex: 'goods_name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '分销佣金比例',
      render: (_, item) => {
        return item.commission_scale_range
          ? `${item.commission_scale_range.min}% ~ ${item.commission_scale_range.max}%`
          : item.commission_scale_internal
          ? `${item.commission_scale_internal}%`
          : '0%'
      },
      width: 160,
      align: 'center'
    },
    {
      title: '上级分销佣金比例',
      render: (_, item) => {
        return item.secondary_scale_range
          ? `${item.secondary_scale_range.min}% ~ ${item.secondary_scale_range.max}%`
          : item.secondary_scale
          ? `${item.secondary_scale}%`
          : '0%'
      },
      width: 160,
      align: 'center'
    },
    {
      title: '销售价',
      render: (_, item) =>
        item.price_range
          ? `¥${item.price_range.min} ~ ¥${item.price_range.max}`
          : `¥${item.price}`,
      width: 180,
      align: 'center'
    },
    {
      title: '成本价',
      render: (_, item) =>
        item.costprice_range
          ? `¥${item.costprice_range.min} ~ ¥${item.costprice_range.max}`
          : `¥${item.costprice}`,
      width: 180,
      align: 'center'
    },
    {
      title: '内购价',
      render: (_, item) =>
        item.internal_price_range
          ? `¥${item.internal_price_range.min} ~ ¥${item.internal_price_range.max}`
          : `¥${item.internal_price}`,
      width: 180,
      align: 'center'
    },
    {
      title: '结算方式',
      render: (_, item) => {
        if (item.rule_id && item.rule_id > 0) {
          if (item.commission_type === 1) {
            return '确认收货后立即发放'
          } else {
            return `确认收货${item.days}天后发放`
          }
        } else {
          return '暂无'
        }
      },
      width: 180,
      align: 'center'
    },
    {
      title: '时间',
      render: (_, item) =>
        item.ctime && item.remove_time
          ? `${formatDateTime(item.ctime)} - ${formatDateTime(
              item.remove_time
            )}`
          : '-',
      width: TableCellWidth.dateRange,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Button type='text'>下单明细</Button>
          <Button type='text'>业绩统计</Button>
        </div>
      ),
      fixed: 'right',
      width: 170,
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
            name='goods_name'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入商品名称'
                style={{ width: '264px' }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='is_custom'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择分销规则'
                style={{ width: '264px' }}
              >
                <Select.Option value={1}>自定义规则</Select.Option>
                <Select.Option value={2}>默认规则</Select.Option>
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
          <Button type='primary' icon={<Plus className='inline size-4' />}>
            新增
          </Button>
        </form>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 330 }}
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
