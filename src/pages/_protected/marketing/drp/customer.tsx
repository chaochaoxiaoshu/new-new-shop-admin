import { Button, Input, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetDistrCustomersRes, getDistrCustomers } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'distr-customers'

export const Route = createFileRoute('/_protected/marketing/drp/customer')({
  validateSearch: type({
    'user_mobile?': 'string',
    'p_user_mobile?': 'string',
    'binding_relationship?': '1 | 2',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    distrCustomersQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getDistrCustomers({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.distrCustomersQueryOptions)
  },
  component: DistrCustomerView,
  head: () => getHead('客户关系查询')
})

function DistrCustomerView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.distrCustomersQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetDistrCustomersRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '客户手机号',
      dataIndex: 'user_mobile',
      width: TableCellWidth.mobile,
      align: 'center'
    },
    {
      title: '客户昵称',
      dataIndex: 'user_name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '所属分销员ID',
      dataIndex: 'p_user_id',
      width: TableCellWidth.id + 40,
      align: 'center'
    },
    {
      title: '所属分销员手机号',
      dataIndex: 'p_user_mobile',
      width: TableCellWidth.mobile + 30,
      align: 'center'
    },
    {
      title: '所属分销员昵称',
      dataIndex: 'p_user_name',
      width: 148,
      align: 'center'
    },
    {
      title: '绑定时间',
      render: (_, item) => formatDateTime(item.binding_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '解绑时间',
      render: (_, item) => formatDateTime(item.unbinding_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '绑定有效期',
      render: (_, item) => formatDateTime(item.binding_validity),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '绑定保护期',
      render: (_, item) => formatDateTime(item.binding_protection),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '绑定关系',
      render: (_, item) =>
        item.binding_relationship == 1
          ? '有效'
          : item.binding_relationship == 2
          ? '失效'
          : '-',
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={item.binding_relationship == 1}>
            <Button type='text'>解除关系</Button>
          </Show>
        </div>
      ),
      fixed: 'right',
      width: 120,
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
            name='user_mobile'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入客户手机号'
                style={{ width: 264 }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Controller
            name='p_user_mobile'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入分销员手机号'
                style={{ width: 264 }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Controller
            name='binding_relationship'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择类型'
                style={{ width: 264 }}
              >
                <Select.Option value={1}>有效</Select.Option>
                <Select.Option value={2}>失效</Select.Option>
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
        rowKey='id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 128 }}
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
