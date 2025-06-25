import { type } from 'arktype'
import dayjs from 'dayjs'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'

import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Select
} from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  GetMultiDiscountsRes,
  MultiDiscountStatus,
  getMultiDiscounts
} from '@/api'
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

const LIST_KEY = 'multi-discounts'

export const Route = createFileRoute('/_protected/marketing/piece/')({
  validateSearch: type({
    'name?': 'string',
    'operate?': '1 | 2 | 3 | 5',
    'stime?': 'number',
    'etime?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    multiDiscountsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getMultiDiscounts({
          ...search,
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

  const { tempSearch, setTempSearch, updateSearchField, commit, reset } =
    useTempSearch({
      search,
      updateFn: (search) => navigate({ search }),
      selectDefaultFields: paginationFields
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
                  <Menu.Item key='edit'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/piece/copy')}>
                  <Menu.Item key='edit'>复制</Menu.Item>
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
                  <Menu.Item key='edit'>暂停</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/start') &&
                    item.operate === MultiDiscountStatus.暂停中
                  }
                >
                  <Menu.Item key='edit'>启动</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/piece/end') &&
                    item.operate === MultiDiscountStatus.暂停中
                  }
                >
                  <Menu.Item key='edit'>结束</Menu.Item>
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
          <DatePicker.RangePicker
            value={
              tempSearch.stime && tempSearch.etime
                ? [dayjs.unix(tempSearch.stime), dayjs.unix(tempSearch.etime)]
                : undefined
            }
            style={{ width: '264px' }}
            onChange={(val) => {
              if (!(val as string[] | undefined)) {
                setTempSearch((prev) => ({
                  ...prev,
                  stime: undefined,
                  etime: undefined
                }))
              } else {
                setTempSearch((prev) => ({
                  ...prev,
                  stime: dayjs(val[0]).unix(),
                  etime: dayjs(val[1]).unix()
                }))
              }
            }}
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
