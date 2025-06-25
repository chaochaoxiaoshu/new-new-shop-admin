import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'

import { Button, Input } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { GetDeliveriesRes, getDeliveries } from '@/api'
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

const LIST_KEY = 'deliveries'

export const Route = createFileRoute('/_protected/order/dispatch')({
  validateSearch: type({
    'delivery_id?': 'string',
    'order_id?': 'string',
    'logi_no?': 'string',
    'ship_mobile?': 'string',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    deliveriesQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getDeliveries({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.deliveriesQueryOptions)
  },
  component: DeliveryView,
  head: () => getHead('发货单')
})

function DeliveryView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { tempSearch, updateSearchField, commit, reset } = useTempSearch({
    search,
    updateFn: (search) => navigate({ search }),
    selectDefaultFields: paginationFields
  })

  const { data, isFetching } = useQuery(context.deliveriesQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetDeliveriesRes>([
    {
      title: '订单号',
      dataIndex: 'order_id',
      fixed: 'left',
      width: 230,
      align: 'center'
    },
    {
      title: '发货单号',
      dataIndex: 'delivery_id',
      width: 210,
      align: 'center'
    },
    {
      title: '快递公司',
      dataIndex: 'logi_code',
      width: 100,
      align: 'center'
    },
    {
      title: '快递单号',
      dataIndex: 'logi_no',
      width: 230,
      align: 'center'
    },
    {
      title: '收货人',
      dataIndex: 'ship_name',
      width: 120,
      align: 'center'
    },
    {
      title: '收货地址',
      dataIndex: 'ship_address',
      align: 'center',
      ellipsis: true
    },
    {
      title: '收货电话',
      dataIndex: 'ship_mobile',
      width: TableCellWidth.mobile,
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      width: TableCellWidth.datetime,
      align: 'center',
      render: (_, record) => formatDateTime(record.ctime)
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <div className='actions'>
          <Show when={checkActionPermission('/order/dispatch/detail')}>
            <Button type='text' onClick={() => handleViewDetail(record)}>
              明细
            </Button>
          </Show>
        </div>
      ),
      fixed: 'right',
      align: 'center'
    }
  ])

  const handleViewDetail = (item: GetDeliveriesRes) => {
    // 查看发货单详情的逻辑，可以是导航到详情页或打开模态框
    console.log('View delivery detail:', item)
  }

  return (
    <TableLayout
      header={
        <TableLayout.Header>
          <Input
            placeholder='请输入发货单号'
            value={tempSearch.delivery_id}
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('delivery_id', value)}
          />
          <Input
            placeholder='请输入订单号'
            value={tempSearch.order_id}
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('order_id', value)}
          />
          <Input
            placeholder='请输入快递单号'
            value={tempSearch.logi_no}
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('logi_no', value)}
          />
          <Input
            placeholder='请输入电话号'
            value={tempSearch.ship_mobile}
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('ship_mobile', value)}
          />
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
        </TableLayout.Header>
      }
    >
      <MyTable
        rowKey='delivery_id'
        data={data?.items ?? []}
        columns={columns}
        loading={isFetching}
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
