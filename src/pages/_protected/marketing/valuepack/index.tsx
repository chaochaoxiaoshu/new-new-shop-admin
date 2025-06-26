import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { BundleDealStatus, GetBundleDealsRes, getBundleDeals } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import { paginationFields, useTempSearch } from '@/hooks'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'bundle-deals'

export const Route = createFileRoute('/_protected/marketing/valuepack/')({
  validateSearch: type({
    'name?': 'string',
    'operate?': '1 | 3 | 4 | 2',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    bundleDealsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getBundleDeals({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.bundleDealsQueryOptions)
  },
  component: ValuepackView,
  head: () => getHead('N元N件')
})

function ValuepackView() {
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

  const { data, isFetching } = useQuery(context.bundleDealsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetBundleDealsRes>([
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
      render: (_, item) => `${item.price} 元 ${item.num} 件`,
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
        const operateMap: Record<BundleDealStatus, string> = {
          0: '未开始',
          3: '进行中',
          4: '已结束',
          2: '已失效'
        }
        return operateMap[item.operate as BundleDealStatus]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '支付订单',
      dataIndex: 'order_num',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '参与客户',
      dataIndex: 'user_num',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '实付金额',
      dataIndex: 'amount',
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/valuepack/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/valuepack/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show when={item.operate === BundleDealStatus.进行中}>
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show when={checkActionPermission('/marketing/valuepack/del')}>
                  <Menu.Item key='edit'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/valuepack/copy')}>
                  <Menu.Item key='edit'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/valuepack/edit') &&
                    item.operate === BundleDealStatus.未开始
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/valuepack/lose') &&
                    item.operate === BundleDealStatus.进行中
                  }
                >
                  <Menu.Item key='edit'>立即结束</Menu.Item>
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
            value={tempSearch.operate}
            placeholder='请选择状态'
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('operate', value as number)}
          >
            <Select.Option value={1}>未开始</Select.Option>
            <Select.Option value={3}>进行中</Select.Option>
            <Select.Option value={4}>已结束</Select.Option>
            <Select.Option value={2}>已失效</Select.Option>
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
              checkActionPermission('/marketing/valuepack/add') &&
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
