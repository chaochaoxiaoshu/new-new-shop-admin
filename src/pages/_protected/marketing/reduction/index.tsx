import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { FreeShipStatus, GetFreeShipsRes, getFreeShips } from '@/api'
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

const LIST_KEY = 'free-ships'

export const Route = createFileRoute('/_protected/marketing/reduction/')({
  validateSearch: type({
    'name?': 'string',
    'operate?': '5 | 3 | 4 | 2',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    freeShipsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getFreeShips({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.freeShipsQueryOptions)
  },
  component: FreeShipsView,
  head: () => getHead('满减邮')
})

function FreeShipsView() {
  const context = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.freeShipsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetFreeShipsRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '活动名称',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '活动详情',
      render: (_, item) => {
        if (item.type === 1) {
          return `满 ${item.full} 元，包邮`
        } else if (item.type === 2) {
          return `满 ${item.full} 件，包邮`
        }
        return '-'
      },
      width: 140,
      align: 'center'
    },
    {
      title: '创建时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '活动时间',
      render: (_, item) =>
        `${formatDateTime(item.stime)} - ${formatDateTime(item.etime)}`,
      width: TableCellWidth.dateRange,
      align: 'center'
    },
    {
      title: '状态',
      render: (_, item) => {
        if (!item.operate) return '-'
        const operateMap: Record<FreeShipStatus, string> = {
          0: '未开始',
          3: '进行中',
          4: '已结束',
          2: '已失效'
        }
        return operateMap[item.operate as FreeShipStatus]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '支付订单',
      dataIndex: 'count_order',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '参与客户',
      dataIndex: 'count_user',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '实付金额',
      render: (_, item) => (item.sum_money ? `¥ ${item.sum_money}` : '-'),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/reduction/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/reduction/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show when={item.operate === 3 || item.operate === 0}>
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/marketing/reduction/del') &&
                    item.operate !== 3
                  }
                >
                  <Menu.Item key='delete'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/reduction/copy')}>
                  <Menu.Item key='copy'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/reduction/edit') &&
                    item.operate === 0
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/reduction/lose') &&
                    item.operate === 3
                  }
                >
                  <Menu.Item key='invalidate'>立即结束</Menu.Item>
                </Show>
              </Menu>
            }
          >
            <Button type='text' icon={<Ellipsis className='inline size-4' />} />
          </Dropdown>
        </div>
      ),
      width: 200,
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
                style={{ width: '264px' }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='operate'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择状态'
                style={{ width: '264px' }}
              >
                <Select.Option value={5}>未开始</Select.Option>
                <Select.Option value={3}>进行中</Select.Option>
                <Select.Option value={4}>已结束</Select.Option>
                <Select.Option value={2}>已失效</Select.Option>
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
          <Show
            when={
              checkActionPermission('/marketing/reduction/add') &&
              departmentId !== 0
            }
          >
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
