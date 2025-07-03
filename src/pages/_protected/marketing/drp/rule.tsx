import { Button, Input } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetDistrRulesRes, getDistrRules } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import { defineTableColumns, queryClient, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'distr-rules'

export const Route = createFileRoute('/_protected/marketing/drp/rule')({
  validateSearch: type({
    'rule_name?': 'string',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    distrRulesQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getDistrRules({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.distrRulesQueryOptions)
  },
  component: DistrRulesView,
  head: () => getHead('分销规则')
})

function DistrRulesView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.distrRulesQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetDistrRulesRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '规则名称',
      dataIndex: 'rule_name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '推荐人',
      render: (_, item) =>
        item.referrer_settings === 1 ? '不限制' : '仅购买过店铺内商品的顾客',
      width: 240,
      align: 'center'
    },
    {
      title: '被推荐人',
      render: (_, item) =>
        item.recommended_person_setting === 1
          ? '不限制'
          : '从未购买过店铺内商品的顾客',
      width: 240,
      align: 'center'
    },
    {
      title: '分销员佣金比例',
      render: (_, item) => `${item.commission_scale_internal}%`,
      width: TableCellWidth.count + 40,
      align: 'center'
    },
    {
      title: '上级分销员佣金比例',
      render: (_, item) => `${item.secondary_scale}%`,
      width: TableCellWidth.count + 70,
      align: 'center'
    },
    {
      title: '佣金获取对象',
      render: (_, item) =>
        item.is_own === 1 ? '自己购买获取佣金' : '自己购买不获取佣金',
      width: 240,
      align: 'center'
    },
    {
      title: '佣金结算方式',
      render: (_, item) =>
        item.commission_type === 1
          ? '确认收货后立即发放'
          : `确认收货${item.days ?? '-'}天之后发放`,
      width: 240,
      align: 'center'
    },
    {
      title: '海报获取',
      render: (_, item) =>
        item.post === 1 ? '购买前/后均可获取' : '购买后才可获取',
      width: 240,
      align: 'center'
    },
    {
      title: '是否默认',
      render: (_, item) => (item.is_def === 1 ? '是' : '否'),
      width: 120,
      align: 'center'
    },
    {
      title: '启用状态',
      render: (_, item) => (item.status === 1 ? '开启' : '关闭'),
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Button type='text'>编辑</Button>
        </div>
      ),
      fixed: 'right',
      width: 100,
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
            name='rule_name'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='规则名称'
                style={{ width: 264 }}
                suffix={<Search className='inline size-4' />}
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
          <Show when={data?.paginate.total === 0}>
            <Button type='primary' icon={<Plus className='inline size-4' />}>
              新增
            </Button>
          </Show>
        </form>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 240 }}
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
