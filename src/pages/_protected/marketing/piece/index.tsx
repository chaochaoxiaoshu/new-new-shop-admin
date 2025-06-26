import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import {
  GetMultiDiscountsRes,
  getMultiDiscounts,
  MultiDiscountStatus
} from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
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

const LIST_KEY = 'multi-discounts'

export const Route = createFileRoute('/_protected/marketing/piece/')({
  validateSearch: type({
    'name?': 'string',
    'operate?': '0 | 1 | 2 | 3 | 5',
    'range?': ['number', 'number'],
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    multiDiscountsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getMultiDiscounts({
          ...search,
          stime: search.range?.[0],
          etime: search.range?.[1],
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.multiDiscountsQueryOptions)
  },
  component: MultiDiscountsView,
  head: () => getHead('X件X折')
})

function MultiDiscountsView() {
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

  const { data, isFetching } = useQuery(context.multiDiscountsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetMultiDiscountsRes>([
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
        `${formatDateTime(item.stime)} - ${formatDateTime(item.etime)}`,
      width: TableCellWidth.dateRange,
      align: 'center'
    },
    {
      title: '支付订单',
      dataIndex: 'payment_order',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '实付金额',
      dataIndex: 'payment_amount',
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '活动状态',
      render: (_, item) => {
        if (!item.operate) return '-'
        const operateMap: Record<MultiDiscountStatus, string> = {
          1: '未开始',
          2: '进行中',
          3: '已结束',
          5: '暂停中'
        }
        return operateMap[item.operate as MultiDiscountStatus]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '创建时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/piece/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/piece/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show when={item.operate === MultiDiscountStatus.进行中}>
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/del') &&
                    item.operate !== MultiDiscountStatus.进行中
                  }
                >
                  <Menu.Item key='delete'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/piece/copy')}>
                  <Menu.Item key='copy'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/edit') &&
                    item.operate === MultiDiscountStatus.未开始 &&
                    departmentId !== 0
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/pause') &&
                    item.operate === MultiDiscountStatus.进行中
                  }
                >
                  <Menu.Item key='pause'>暂停</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/start') &&
                    item.operate === MultiDiscountStatus.暂停中
                  }
                >
                  <Menu.Item key='start'>启动</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/end') &&
                    item.operate === MultiDiscountStatus.暂停中
                  }
                >
                  <Menu.Item key='end'>结束</Menu.Item>
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
                <Select.Option value={0}>全部</Select.Option>
                <Select.Option value={MultiDiscountStatus.未开始}>
                  未开始
                </Select.Option>
                <Select.Option value={MultiDiscountStatus.进行中}>
                  进行中
                </Select.Option>
                <Select.Option value={MultiDiscountStatus.已结束}>
                  已结束
                </Select.Option>
                <Select.Option value={MultiDiscountStatus.暂停中}>
                  暂停中
                </Select.Option>
              </Select>
            )}
          />
          <Controller
            control={control}
            name='range'
            render={({ field }) => (
              <MyDatePicker.RangePicker {...field} style={{ width: '264px' }} />
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
              checkActionPermission('/marketing/piece/add') &&
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
