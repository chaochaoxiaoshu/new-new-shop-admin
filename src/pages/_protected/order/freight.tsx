import { Button, Dropdown, Menu } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus } from 'lucide-react'
import { GetShipTemplatesRes, getShipTemps } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import { defineTableColumns, queryClient, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'ship-temps'

export const Route = createFileRoute('/_protected/order/freight')({
  validateSearch: type({
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    shipTempsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getShipTemps({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.shipTempsQueryOptions)
  },
  component: FreightView,
  head: () => getHead('运费模板')
})

function FreightView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { data, isFetching } = useQuery(context.shipTempsQueryOptions)

  const { columns } = defineTableColumns<GetShipTemplatesRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '配送方式名称',
      dataIndex: 'name',
      align: 'center'
    },
    {
      title: '适用商品个数',
      render: (_, item) => (
        <Button type='text'>{item.products_count ?? 0}</Button>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <Dropdown
          trigger='click'
          droplist={
            <Menu>
              <Show when={checkActionPermission('/order/freight/edit')}>
                <Menu.Item key='edit'>编辑</Menu.Item>
              </Show>
              <Show when={checkActionPermission('/order/freight/del')}>
                <Menu.Item key='delete'>删除</Menu.Item>
              </Show>
            </Menu>
          }
        >
          <Button type='text' icon={<Ellipsis className='inline size-4' />} />
        </Dropdown>
      ),
      width: 80,
      fixed: 'right',
      align: 'center'
    }
  ])

  return (
    <TableLayout
      header={
        <div>
          <Show when={checkActionPermission('/order/freight/add')}>
            <Button type='primary' icon={<Plus className='inline size-4' />}>
              新增
            </Button>
          </Show>
        </div>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        columns={columns}
        loading={isFetching}
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
