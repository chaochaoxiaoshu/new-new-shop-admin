import {
  Button,
  Dropdown,
  Input,
  Menu,
  Popover,
  Select,
  Switch
} from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { ChevronDown, Ellipsis, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { GetTimelinesRes, getTimelines } from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'timelines'

export const Route = createFileRoute('/_protected/marketing/timeline/')({
  validateSearch: type({
    'task_name?': 'string',
    'goods_name?': 'string',
    'status?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    timelinesQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getTimelines({
          ...search,
          with_fields: 'images',
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.timelinesQueryOptions)
  },
  component: TimelineView,
  head: () => getHead('素材库')
})

function TimelineView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const departmentId = useUserStore((store) => store.departmentId)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(context.timelinesQueryOptions)

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  /* ------------------------------- 批量操作 START ------------------------------- */
  const [batchListOrDelistCurrent, setBatchListOrDelistCurrent] = useState<
    1 | 2
  >(1)

  const batchListOrDelistCurrentButtonLabel =
    batchListOrDelistCurrent === 1 ? '上架' : '下架'

  const { mutateAsync: handleBatchListOrDelistCurrent } = useMutation({
    mutationKey: ['batch-list-or-delist-timeline'],
    mutationFn: (marketable: 1 | 2) => {
      setBatchListOrDelistCurrent(marketable)
      // [TODO]: 请求发布或下架的函数
    },
    ...getNotifs({
      key: 'batch-list-or-delist-timeline',
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
        setSelectedRowKeys([])
      }
    })
  })
  /* -------------------------------- 批量操作 END -------------------------------- */

  const handleUpdateSticky = ({
    id,
    sticky
  }: {
    id?: number
    sticky: 1 | 2
  }) => {
    if (!id) return
    // [TODO]: 请求上架/下架
  }

  const { columns, totalWidth } = defineTableColumns<GetTimelinesRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: TableCellWidth.id
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '内容',
      render: (_, item) => (
        <Popover
          content={
            <div
              dangerouslySetInnerHTML={{ __html: item.task_content ?? '-' }}
            />
          }
        >
          <div
            className='truncate'
            dangerouslySetInnerHTML={{ __html: item.task_content ?? '-' }}
          />
        </Popover>
      ),
      width: 240,
      align: 'center'
    },
    {
      title: '关联商品',
      dataIndex: 'goods_name',
      width: 200,
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '置顶',
      render: (_, item) => (
        <Switch
          checked={item.sticky === 1}
          onChange={(value) =>
            handleUpdateSticky({ id: item.id, sticky: value ? 1 : 2 })
          }
        />
      ),
      width: 90,
      align: 'center'
    },
    {
      title: '发布状态',
      render: (_, item) => (item.publish_status === 1 ? '未发布' : '已发布'),
      width: 100,
      align: 'center'
    },
    {
      title: '创建人',
      dataIndex: 'creator_name',
      width: 120,
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '发布时间',
      render: (_, item) => formatDateTime(item.publish_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '更新时间',
      render: (_, item) => formatDateTime(item.update_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '创建时间',
      render: (_, item) => formatDateTime(item.create_time),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <Dropdown
          trigger='click'
          droplist={
            <Menu>
              <Show when={item.publish_status === 1}>
                <Menu.Item key='publish'>发布</Menu.Item>
              </Show>
              <Show when={item.publish_status !== 1}>
                <Menu.Item key='unpublish'>下架</Menu.Item>
              </Show>
              <Menu.Item key='detail'>详情</Menu.Item>
              <Show when={item.publish_status === 1}>
                <Menu.Item key='edit'>编辑</Menu.Item>
              </Show>
              <Show when={item.publish_status === 1}>
                <Menu.Item key='delete'>删除</Menu.Item>
              </Show>
            </Menu>
          }
        >
          <Button type='text' icon={<Ellipsis className='inline size-4' />} />
        </Dropdown>
      ),
      fixed: 'right',
      width: 80,
      align: 'center'
    }
  ])

  return (
    <TableLayout
      header={
        <div className='flex flex-col'>
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
              name='task_name'
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder='请输入任务名称'
                  style={{ width: 264 }}
                  suffix={<Search className='inline size-4' />}
                />
              )}
            />
            <Controller
              control={control}
              name='goods_name'
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder='请输入商品名称'
                  style={{ width: 264 }}
                  suffix={<Search className='inline size-4' />}
                />
              )}
            />
            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='请选择发布状态'
                  style={{ width: 264 }}
                >
                  <Select.Option value={1}>未发布</Select.Option>
                  <Select.Option value={2}>已发布</Select.Option>
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
          </form>
          <div className='flex items-center h-5 mt-6'>
            <div className='font-semibold mr-4'>任务列表</div>
            <div className='ml-auto flex items-center space-x-3'>
              <Button.Group>
                <Button disabled={!selectedRowKeys.length} type='secondary'>
                  {batchListOrDelistCurrentButtonLabel}
                </Button>
                <Dropdown
                  disabled={!selectedRowKeys.length}
                  trigger='click'
                  position='br'
                  droplist={
                    <Menu>
                      <Menu.Item
                        key='1'
                        onClick={() => handleBatchListOrDelistCurrent(1)}
                      >
                        发布
                      </Menu.Item>
                      <Menu.Item
                        key='2'
                        onClick={() => handleBatchListOrDelistCurrent(2)}
                      >
                        下架
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button
                    type='secondary'
                    icon={<ChevronDown className='inline size-4' />}
                  />
                </Dropdown>
              </Button.Group>
              <Button disabled={!selectedRowKeys.length} type='secondary'>
                删除
              </Button>
              <Show when={departmentId !== 0}>
                <Button type='primary'>新增</Button>
              </Show>
            </div>
          </div>
        </div>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 240 }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (selectedRowKeys) =>
            setSelectedRowKeys(selectedRowKeys as number[])
        }}
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
