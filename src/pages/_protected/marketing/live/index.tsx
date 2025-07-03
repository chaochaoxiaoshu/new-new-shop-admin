import { Button, Input, Popconfirm, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetLiveListRes, getLiveList, LiveStatus } from '@/api'
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

const LIST_KEY = 'live-list'

export const Route = createFileRoute('/_protected/marketing/live/')({
  validateSearch: type({
    'name?': 'string',
    'status?': '1 | 2 | 3 | 4',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    liveListQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getLiveList({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.liveListQueryOptions)
  },
  component: LiveView,
  head: () => getHead('直播列表')
})

function LiveView() {
  const context = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const departmentId = useUserStore((store) => store.departmentId)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.liveListQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetLiveListRes>([
    {
      title: '直播 ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '直播名称',
      dataIndex: 'name',
      ellipsis: true,
      tooltip: true,
      align: 'center'
    },
    {
      title: '直播时间',
      render: (_, item) => formatDateTime(item.start_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '直播状态',
      render: (_, item) => {
        if (item.status === 0) {
          return '未开播'
        } else if (item.status === 1) {
          return '直播中'
        } else if (item.status === 2) {
          return '回放'
        } else if (item.status === 3) {
          return '断流中'
        }
      },
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Button type='text'>数据</Button>
          <Button type='text'>查看</Button>
          <Button type='text'>商品</Button>
          {(item.status === 0 || item.status === 1 || item.status === 3) && (
            <Popconfirm content='确定要失效吗？'>
              <Button type='text'>失效</Button>
            </Popconfirm>
          )}
        </div>
      ),
      width: 220,
      fixed: 'right',
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
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入活动名称'
                style={{ width: 264 }}
                suffix={<Search className='inline size-4' />}
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
                <Select.Option value={LiveStatus.未开播}>未开播</Select.Option>
                <Select.Option value={LiveStatus.直播中}>直播中</Select.Option>
                <Select.Option value={LiveStatus.回放}>回放</Select.Option>
                <Select.Option value={LiveStatus.断流中}>断流中</Select.Option>
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
          <Show when={departmentId !== 0}>
            <Button type='primary' icon={<Plus className='inline size-4' />}>
              新增
            </Button>
          </Show>
        </form>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.list ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 200 }}
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
