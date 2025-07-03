import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { FreeGiftsStatus, GetFreeGiftsRes, getFreeGifts } from '@/api'
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

const LIST_KEY = 'free-gifts'

export const Route = createFileRoute('/_protected/marketing/fulldiscounts/')({
  validateSearch: type({
    'name?': 'string',
    'state?': '"no_start" | "in_progress" | "completed"',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    freeGiftsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getFreeGifts({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.freeGiftsQueryOptions)
  },
  component: FreeGiftsView,
  head: () => getHead('满赠')
})

function FreeGiftsView() {
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

  const { data, isFetching } = useQuery(context.freeGiftsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetFreeGiftsRes>([
    {
      title: '活动名称',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '类型',
      render: (_, item) => {
        if (item.activity_type === 'full_number') {
          return '满件赠'
        } else if (item.activity_type === 'full_price') {
          return '满元赠'
        }
        return '-'
      },
      width: 120,
      align: 'center'
    },
    {
      title: '优惠规则',
      render: (_, item) => {
        if (!item.rule_list?.[0].full_total) return '-'
        return item.rule === 'full_discount'
          ? `满${item.rule_list[0].full_total}送赠品`
          : item.rule === 'every_full_discount'
          ? `每满${item.rule_list[0].full_total}送赠品`
          : '-'
      },
      width: 180,
      align: 'center'
    },
    {
      title: '状态',
      render: (_, item) => {
        if (!item.state) return '-'
        const operateMap: Record<FreeGiftsStatus, string> = {
          no_start: '未开始',
          in_progress: '进行中',
          completed: '已结束',
          invalid: '已失效'
        }
        return operateMap[item.state as FreeGiftsStatus]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '活动时间',
      render: (_, item) =>
        `${formatDateTime(item.start_time)} - ${formatDateTime(item.end_time)}`,
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
      title: '参与客户',
      dataIndex: 'partici_pating',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '订单总额',
      render: (_, item) => formatAmount(item.total_amount),
      width: 100,
      align: 'center'
    },
    {
      title: '笔单价',
      render: (_, item) => formatAmount(item.pen_price),
      width: 100,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/fulldiscounts/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/fulldiscounts/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show
            when={item.state === 'no_start' || item.state === 'in_progress'}
          >
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/marketing/fulldiscounts/del') &&
                    (item.state === 'no_start' || item.state === 'completed')
                  }
                >
                  <Menu.Item key='delete'>删除</Menu.Item>
                </Show>
                <Show
                  when={checkActionPermission('/marketing/fulldiscounts/copy')}
                >
                  <Menu.Item key='copy'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/fulldiscounts/edit') &&
                    item.state === 'no_start'
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/fulldiscounts/lose') &&
                    item.state === 'in_progress'
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
            name='state'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择状态'
                style={{ width: '264px' }}
              >
                <Select.Option value={FreeGiftsStatus.未开始}>
                  未开始
                </Select.Option>
                <Select.Option value={FreeGiftsStatus.进行中}>
                  进行中
                </Select.Option>
                <Select.Option value={FreeGiftsStatus.已结束}>
                  已结束
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
              checkActionPermission('/marketing/fulldiscounts/add') &&
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
