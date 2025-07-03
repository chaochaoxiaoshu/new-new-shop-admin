import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import {
  AddonPurchaseStatus,
  GetAddonPurchasesRes,
  getAddonPurchases
} from '@/api'
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

const LIST_KEY = 'addon-purchase'

export const Route = createFileRoute('/_protected/marketing/purchase/')({
  validateSearch: type({
    'name?': 'string',
    'status?': '0 | 1 | 2 | 3 | 4',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    addonPurchaseQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getAddonPurchases({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.addonPurchaseQueryOptions)
  },
  component: AddonPurchaseView,
  head: () => getHead('加价购')
})

function AddonPurchaseView() {
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

  const { data, isFetching } = useQuery(context.addonPurchaseQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetAddonPurchasesRes>([
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
      title: '活动时间',
      render: (_, item) =>
        `${formatDateTime(item.start_time)} - ${formatDateTime(item.end_time)}`,
      width: TableCellWidth.dateRange,
      align: 'center'
    },
    {
      title: '活动详情',
      render: (_, item) => {
        return `活动商品满 ${item.full_price} 元可加购`
      },
      width: 210,
      align: 'center'
    },
    {
      title: '活动状态',
      render: (_, item) => {
        if (!item.status) return '-'
        const operateMap: Record<AddonPurchaseStatus, string> = {
          1: '未开始',
          2: '进行中',
          3: '已结束',
          4: '已失效'
        }
        return operateMap[item.status as AddonPurchaseStatus]
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
      title: '笔单价',
      render: (_, item) => (item.unit_price ? `¥ ${item.unit_price}` : '-'),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/purchase/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show
            when={
              checkActionPermission('/marketing/purchase/promotion') &&
              item.status === AddonPurchaseStatus.进行中
            }
          >
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/marketing/purchase/del') &&
                    item.status !== AddonPurchaseStatus.进行中
                  }
                >
                  <Menu.Item key='delete'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/purchase/copy')}>
                  <Menu.Item key='copy'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/purchase/edit') &&
                    item.status !== AddonPurchaseStatus.进行中 &&
                    departmentId !== 0
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/purchase/lose') &&
                    item.status === AddonPurchaseStatus.进行中
                  }
                >
                  <Menu.Item key='invalidate'>失效</Menu.Item>
                </Show>
              </Menu>
            }
          >
            <Button type='text' icon={<Ellipsis className='inline size-4' />} />
          </Dropdown>
        </div>
      ),
      width: 160,
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
            name='status'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择状态'
                style={{ width: '264px' }}
              >
                <Select.Option value={0}>全部</Select.Option>
                <Select.Option value={AddonPurchaseStatus.未开始}>
                  未开始
                </Select.Option>
                <Select.Option value={AddonPurchaseStatus.进行中}>
                  进行中
                </Select.Option>
                <Select.Option value={AddonPurchaseStatus.已结束}>
                  已结束
                </Select.Option>
                <Select.Option value={AddonPurchaseStatus.已失效}>
                  已失效
                </Select.Option>
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
              checkActionPermission('/marketing/purchase/add') &&
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
