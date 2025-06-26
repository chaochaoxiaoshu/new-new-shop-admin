import { Button, Dropdown, Input, Menu, Select } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { GetLuckyDrawsRes, getLuckyDraws, LuckyDrawStatus } from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
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

const LIST_KEY = 'lucky-draws'

export const Route = createFileRoute('/_protected/marketing/raffle/')({
  validateSearch: type({
    'name?': 'string',
    'operate?': '1 | 2 | 3 | 5',
    'stime?': 'number',
    'etime?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    luckyDrawsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getLuckyDraws({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.luckyDrawsQueryOptions)
  },
  component: LuckyDrawsView,
  head: () => getHead('幸运大抽奖')
})

function LuckyDrawsView() {
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

  const { data, isFetching } = useQuery(context.luckyDrawsQueryOptions)

  const { columns, totalWidth } = defineTableColumns<GetLuckyDrawsRes>([
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
      title: '抽奖人数',
      render: (_, item) => item.use_num,
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '中奖人数',
      render: (_, item) => item.use_num,
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '活动状态',
      render: (_, item) => {
        if (!item.operate) return '-'
        const operateMap: Record<LuckyDrawStatus, string> = {
          1: '未开始',
          2: '进行中',
          3: '已结束',
          5: '暂停中'
        }
        return operateMap[item.operate as LuckyDrawStatus]
      },
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/marketing/raffle/data')}>
            <Button type='text'>数据</Button>
          </Show>
          <Show when={checkActionPermission('/marketing/raffle/see')}>
            <Button type='text'>查看</Button>
          </Show>
          <Show when={item.operate === LuckyDrawStatus.进行中}>
            <Button type='text'>推广</Button>
          </Show>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/marketing/raffle/del') &&
                    item.operate !== LuckyDrawStatus.进行中
                  }
                >
                  <Menu.Item key='edit'>删除</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/raffle/copy')}>
                  <Menu.Item key='edit'>复制</Menu.Item>
                </Show>
                <Show when={checkActionPermission('/marketing/raffle/edit')}>
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/raffle/pause') &&
                    item.operate === LuckyDrawStatus.进行中
                  }
                >
                  <Menu.Item key='edit'>暂停</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/raffle/start') &&
                    item.operate === LuckyDrawStatus.暂停中
                  }
                >
                  <Menu.Item key='edit'>启动</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/marketing/raffle/end') &&
                    item.operate === LuckyDrawStatus.暂停中
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
            <Select.Option value={LuckyDrawStatus.未开始}>未开始</Select.Option>
            <Select.Option value={LuckyDrawStatus.进行中}>进行中</Select.Option>
            <Select.Option value={LuckyDrawStatus.已结束}>已结束</Select.Option>
          </Select>
          <MyDatePicker.RangePicker
            value={[tempSearch.stime, tempSearch.etime]}
            style={{ width: '264px' }}
            onChange={(val) => {
              setTempSearch((prev) => ({
                ...prev,
                stime: val?.[0],
                etime: val?.[1]
              }))
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
              checkActionPermission('/marketing/raffle/add') &&
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
