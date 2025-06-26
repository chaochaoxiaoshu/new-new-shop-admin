import {
  Button,
  Dropdown,
  Input,
  Menu,
  Select,
  Typography
} from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, RotateCcw, Search } from 'lucide-react'
import {
  confirmReship,
  GetReshipsRes,
  getReshipDetail,
  getReships
} from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { paginationFields, useMyModal, useTempSearch } from '@/hooks'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores/user-store'

const LIST_KEY = 'reships'

export const Route = createFileRoute('/_protected/order/reship')({
  validateSearch: type({
    'reship_id?': 'string',
    'order_id?': 'string',
    'logi_no?': 'string',
    'status?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    reshipsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getReships({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.reshipsQueryOptions)
  },
  component: ReshipView,
  head: () => getHead('退货单')
})

function ReshipView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )
  const [openModal, contextHolder] = useMyModal()

  const { tempSearch, updateSearchField, commit, reset } = useTempSearch({
    search,
    updateFn: (search) => navigate({ search }),
    selectDefaultFields: paginationFields
  })

  /* ------------------------------ Table START ------------------------------ */
  const { data, isFetching } = useQuery(context.reshipsQueryOptions)

  const handleViewDetail = (item: GetReshipsRes) => {
    openModal({
      title: '退货单明细',
      content: <ReshipDetail reship_id={item.reship_id} />
    })
  }

  const { mutate: confirmReshipMutate } = useMutation({
    mutationFn: (reship_id?: string) => {
      if (!reship_id) {
        throw new Error('reship_id 不可为空')
      }
      return confirmReship({ reship_id })
    },
    ...getNotifs({
      key: 'confirm-reship',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { columns, totalWidth } = defineTableColumns<GetReshipsRes>([
    {
      title: '退货单号',
      dataIndex: 'reship_id',
      width: 200,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
      align: 'center'
    },
    {
      title: '用户',
      dataIndex: 'user_info.nickname',
      width: 140,
      align: 'center',
      render: (_, item) => item.user_info?.nickname || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 160,
      align: 'center',
      render: (_, item) => getStatusText(item.status),
      ellipsis: true
    },
    {
      title: '物流公司',
      dataIndex: 'logi_code',
      width: 100,
      align: 'center',
      ellipsis: true
    },
    {
      title: '快递单号',
      dataIndex: 'logi_no',
      width: 200,
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      width: TableCellWidth.datetime,
      align: 'center',
      render: (_, item) => formatDateTime(item.ctime)
    },
    {
      title: '更新时间',
      dataIndex: 'utime',
      width: TableCellWidth.datetime,
      align: 'center',
      render: (_, item) => formatDateTime(item.utime)
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_, item) => (
        <Dropdown
          trigger='click'
          position='br'
          droplist={
            <Menu>
              <Show when={checkActionPermission('/order/reship/detail')}>
                <Menu.Item key='detail' onClick={() => handleViewDetail(item)}>
                  明细
                </Menu.Item>
              </Show>
              <Show
                when={
                  checkActionPermission('/order/reship/finish') &&
                  item.status === 2
                }
              >
                <Menu.Item
                  key='confirm'
                  onClick={() => confirmReshipMutate(item.reship_id)}
                >
                  确认收货
                </Menu.Item>
              </Show>
            </Menu>
          }
        >
          <Button type='text' icon={<Ellipsis className='inline size-4' />} />
        </Dropdown>
      )
    }
  ])
  /* ------------------------------ Table END ------------------------------ */

  return (
    <TableLayout
      header={
        <TableLayout.Header>
          <Input
            placeholder='请输入退货单号'
            value={tempSearch.reship_id}
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('reship_id', value)}
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
          <Select
            placeholder='请选择状态'
            value={tempSearch.status}
            style={{ width: '264px' }}
            onChange={(value) => updateSearchField('status', value as number)}
          >
            <Select.Option value={1}>审核通过待发货</Select.Option>
            <Select.Option value={2}>已发退货</Select.Option>
            <Select.Option value={3}>已收退货</Select.Option>
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
        </TableLayout.Header>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items || []}
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 230 }}
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
      {contextHolder}
    </TableLayout>
  )
}

function getStatusText(status?: number) {
  switch (status) {
    case 1:
      return '审核通过待发货'
    case 2:
      return '已发退货'
    case 3:
      return '已收退货'
    default:
      return '-'
  }
}

function ReshipDetail({ reship_id }: { reship_id?: string }) {
  const { data } = useQuery({
    queryKey: ['reship-detail', reship_id],
    queryFn: () => getReshipDetail({ reship_id: reship_id! }),
    enabled: !!reship_id
  })

  return (
    <div>
      <Typography.Paragraph>
        <Typography.Text>订单号：</Typography.Text>
        {data?.order_id}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>退货单号：</Typography.Text>
        {data?.reship_id}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>用户：</Typography.Text>
        {data?.user_info?.nickname}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>状态：</Typography.Text>
        {getStatusText(data?.status)}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>物流公司：</Typography.Text>
        {data?.logi_code || '-'}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>快递单号：</Typography.Text>
        {data?.logi_no || '-'}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>创建时间：</Typography.Text>
        {formatDateTime(data?.ctime)}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>更新时间：</Typography.Text>
        {formatDateTime(data?.utime)}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text>退货商品：</Typography.Text>
        {data?.reship_items?.map((item, index) => (
          <div key={index}>
            <Typography.Text>{item.name}</Typography.Text>
            <Typography.Text className='ml-4'>×{item.nums}</Typography.Text>
          </div>
        ))}
      </Typography.Paragraph>
    </div>
  )
}
