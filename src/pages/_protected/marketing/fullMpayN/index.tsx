import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'

import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { GetSpendMPayNRes, SpendMPayNStatus, getSpendMPayN } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import { paginationFields, useTempSearch } from '@/hooks'
import {
  TableCellWidth,
  defineTableColumns,
  formatDateTime,
  queryClient
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'spend-m-pay-n-list'

export const Route = createFileRoute('/_protected/marketing/fullMpayN/')({
  validateSearch: type({
    'name?': 'string',
    'state?': '"no_start" | "in_progress" | "completed"',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    spendMpayNQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getSpendMPayN({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.spendMpayNQueryOptions)
  },
  component: FreeGiftsView,
  head: () => getHead('满M付N')
})

function FreeGiftsView() {
  const context = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { tempSearch, updateSearchField, commit, reset } = useTempSearch({
    search,
    updateFn: (search) => navigate({ search }),
    selectDefaultFields: paginationFields
  })

  const { data, isFetching } = useQuery(context.spendMpayNQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetSpendMPayNRes>([
    {
      title: '活动名称',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '活动规则',
      render: (_, item) => {
        return `满 ${item.rule?.full_total} 件付 ${item.rule?.pay_total} 件`
      },
      width: 180,
      align: 'center'
    },
    {
      title: '状态',
      render: (_, item) => {
        if (!item.state) return '-'
        const operateMap: Record<SpendMPayNStatus, string> = {
          no_start: '未开始',
          in_progress: '进行中',
          completed: '已结束',
          invalid: '已失效'
        }
        return operateMap[item.state as SpendMPayNStatus]
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
      dataIndex: 'total_amount',
      width: 100,
      align: 'center'
    },
    {
      title: '笔单价',
      dataIndex: 'pen_price',
      width: 100,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/fullMpayN/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/fullMpayN/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show when={item.state === SpendMPayNStatus.进行中}>
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/marketing/fullMpayN/del') &&
                    item.state !== SpendMPayNStatus.进行中
                  }
                >
                  <Menu.Item key='edit'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/fullMpayN/copy')}>
                  <Menu.Item key='edit'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/fullMpayN/edit') &&
                    item.state === SpendMPayNStatus.未开始
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/fullMpayN/lose') &&
                    item.state === SpendMPayNStatus.进行中
                  }
                >
                  <Menu.Item key='edit'>失效</Menu.Item>
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
        <TableLayout.Header>
          <Input
            value={tempSearch.name}
            placeholder='请输入活动名称'
            style={{ width: '264px' }}
            suffix={<Search className='inline size-4' />}
            onChange={(value) => updateSearchField('name', value)}
          />
          <Select
            value={tempSearch.state}
            placeholder='请选择状态'
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('state', value as string)}
          >
            <Select.Option value={SpendMPayNStatus.未开始}>
              未开始
            </Select.Option>
            <Select.Option value={SpendMPayNStatus.进行中}>
              进行中
            </Select.Option>
            <Select.Option value={SpendMPayNStatus.已结束}>
              已结束
            </Select.Option>
          </Select>
          <Button
            type='primary'
            icon={<Search className='inline size-4' />}
            onClick={commit}
          >
            查询
          </Button>
          <Button
            type='outline'
            icon={<RotateCcw className='inline size-4' />}
            onClick={reset}
          >
            重置
          </Button>
          <Show
            when={
              checkActionPermission('/marketing/fullMpayN/add') &&
              departmentId !== 0
            }
          >
            <Button type='primary' icon={<Plus className='inline size-4' />}>
              新增
            </Button>
          </Show>
        </TableLayout.Header>
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
