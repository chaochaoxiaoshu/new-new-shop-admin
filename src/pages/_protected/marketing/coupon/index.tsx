import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { CouponStatus, GetCouponsRes, getCoupons } from '@/api'
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

const LIST_KEY = 'coupons'

export const Route = createFileRoute('/_protected/marketing/coupon/')({
  validateSearch: type({
    'name?': 'string',
    'type?': '1 | 2 | 3',
    'operate?': '5 | 3 | 4 | 2',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    couponsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getCoupons({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.couponsQueryOptions)
  },
  component: CouponsView,
  head: () => getHead('优惠券')
})

function CouponsView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { tempSearch, updateSearchField, commit, reset } = useTempSearch({
    search,
    updateFn: (search) => navigate({ search }),
    selectDefaultFields: paginationFields
  })

  const { data, isFetching } = useQuery(context.couponsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetCouponsRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '类型',
      render: (_, item) => {
        if (!item.type) return '-'
        const typeMap = {
          1: '满减券',
          2: '折扣券',
          3: '无门槛券'
        }
        return typeMap[item.type]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '优惠内容',
      dataIndex: 'contenttype',
      width: 180,
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
        const operateMap: Record<CouponStatus, string> = {
          0: '未开始',
          3: '进行中',
          4: '已结束',
          2: '已失效'
        }
        return operateMap[item.operate]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '已领取',
      dataIndex: 'received',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '剩余',
      dataIndex: 'total',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '已使用',
      dataIndex: 'used',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '用券成交总额',
      dataIndex: 'total_coupons',
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '优惠总金额',
      dataIndex: 'total_amount',
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/coupon/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/coupon/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show
            when={
              item.operate === CouponStatus.进行中 ||
              item.operate === CouponStatus.未开始
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
                    item.operate === CouponStatus.进行中 && item.settings === 2
                  }
                >
                  <Menu.Item key='edit'>定向发放</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/coupon/del')}>
                  <Menu.Item key='edit'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/coupon/edit')}>
                  <Menu.Item key='edit'>复制</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/coupon/edit') &&
                    (item.operate === CouponStatus.未开始 ||
                      item.operate === CouponStatus.进行中)
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/coupon/lose') &&
                    item.operate === CouponStatus.进行中
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
      align: 'center',
      width: 200,
      fixed: 'right'
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
            value={tempSearch.type}
            placeholder='请选择类型'
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('type', value as number)}
          >
            <Select.Option value={1}>满减券</Select.Option>
            <Select.Option value={2}>折扣券</Select.Option>
            <Select.Option value={3}>无门槛券</Select.Option>
          </Select>
          <Select
            value={tempSearch.operate}
            placeholder='请选择状态'
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('operate', value as number)}
          >
            <Select.Option value={5}>未开始</Select.Option>
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
              checkActionPermission('/marketing/coupon/add') &&
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
