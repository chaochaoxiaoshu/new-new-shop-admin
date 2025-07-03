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
import { defineTableColumns, queryClient, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'distr-list'

export const Route = createFileRoute('/_protected/marketing/drp/distrList/')({
  validateSearch: type({
    'goods_name?': 'string',
    'is_custom?': '1 | 2',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    distrListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getDrpList({
          ...search,
          department: useUserStore.getState().departmentId!,
          status: 1
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.distrListQueryOptions)
  },
  component: DistrListView,
  head: () => getHead('分销列表')
})

function DistrListView() {
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
      title: '上架状态',
      dataIndex: 'marketable',
      slotName: 'marketable',
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Button type='text'>设置</Button>
          <Button type='text'>数据</Button>
          <Button type='text'>移除</Button>
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
