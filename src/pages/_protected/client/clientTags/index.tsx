import {
  Button,
  Dropdown,
  Input,
  Menu,
  ResizeBox,
  Select
} from '@arco-design/web-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Ellipsis, GripVertical, Plus, RotateCcw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  GetPaginatedTagGroupsRes,
  GetTagsRes,
  getPaginatedTagGroups,
  getTags
} from '@/api'
import { Show } from '@/components/show'
import { SortableTable } from '@/components/sortable-table'
import { SortableTableDragHandle } from '@/components/sortable-table/drag-handle'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import { useTempSearch } from '@/hooks'
import { defineTableColumns, formatDateTime, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

export const Route = createFileRoute('/_protected/client/clientTags/')({
  validateSearch: type({
    'tagGroupId?': 'number',
    'tag_name?': 'string',
    'type?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  component: RouteComponent,
  head: () => getHead('客户标签')
})

function RouteComponent() {
  return (
    <ResizeBox.Split
      direction='horizontal'
      style={{
        flex: '1 1 auto',
        height: '100%'
      }}
      max={0.8}
      min={0.2}
      size='320px'
      panes={[<TagGroupsView />, <TagsView />]}
    />
  )
}

function TagGroupsView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  type SearchParams = {
    group_name?: string
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const [tempSearchText, setTempSearchText] = useState<string>('')

  const { data, isFetching } = useQuery({
    queryKey: ['paginated-tag-groups', searchParams],
    queryFn: () =>
      getPaginatedTagGroups({
        ...searchParams,
        department_id: useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData
  })

  const { columns } = defineTableColumns([
    {
      title: '',
      render: () => {
        return (
          <SortableTableDragHandle>
            <Button
              type='text'
              size='small'
              style={{
                paddingLeft: 1,
                paddingRight: 1,
                paddingTop: 2,
                paddingBottom: 2,
                color: 'var(--foreground)',
                cursor: 'grab'
              }}
            >
              <GripVertical className='inline size-4' />
            </Button>
          </SortableTableDragHandle>
        )
      },
      width: 52,
      align: 'center',
      fixed: 'left'
    },
    {
      title: '标签组名称',
      dataIndex: 'group_name',
      ellipsis: true,
      align: 'center'
    }
  ])

  return (
    <TableLayout
      className='min-w-0'
      header={
        <TableLayout.Header className='flex-nowrap gap-3'>
          <Input.Search
            value={tempSearchText}
            searchButton
            placeholder='标签组名称'
            onChange={(val) => setTempSearchText(val)}
            onSearch={() =>
              setSearchParams((prev) => ({
                ...prev,
                group_name: tempSearchText
              }))
            }
          />
          <Show when={checkActionPermission('/client/clientTags/add')}>
            <Button
              type='primary'
              className='flex-none'
              icon={<Plus className='inline size-4' />}
            />
          </Show>
        </TableLayout.Header>
      }
    >
      <SortableTable<GetPaginatedTagGroupsRes>
        rowKey='id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        borderCell
        pagination={{
          current: data?.paginate.page_index,
          pageSize: data?.paginate.page_size,
          total: data?.paginate.total,
          onChange: (current, pageSize) => {
            setSearchParams((prev) => ({
              ...prev,
              page_index: current,
              page_size: pageSize
            }))
          }
        }}
        hover={false}
        rowClassName={(item) =>
          item.id === search.tagGroupId
            ? 'table-active-row clickable-row'
            : 'clickable-row'
        }
        onRow={(item) => ({
          onClick: () =>
            navigate({
              search: {
                ...search,
                tagGroupId: item.id,
                page_index: 1,
                page_size: 20
              }
            })
        })}
      />
    </TableLayout>
  )
}

function TagsView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { tempSearch, updateSearchField, commit, reset } = useTempSearch({
    search,
    updateFn: (search) => navigate({ search }),
    selectDefaultFields: (search) => ({
      tagGroupId: search.tagGroupId,
      page_index: search.page_index,
      page_size: search.page_size
    })
  })

  useEffect(() => {
    if (tempSearch.tagGroupId !== search.tagGroupId) {
      updateSearchField('tagGroupId', search.tagGroupId)
    }
  }, [search, tempSearch.tagGroupId, updateSearchField])

  const { data, isFetching } = useQuery({
    queryKey: ['tags', search],
    queryFn: () =>
      getTags({
        ...search,
        group_id: search.tagGroupId!
      }),
    placeholderData: keepPreviousData,
    enabled: !!search.tagGroupId
  })

  const { columns, totalWidth } = defineTableColumns<GetTagsRes>([
    {
      title: '',
      render: () => {
        return (
          <SortableTableDragHandle>
            <Button
              type='text'
              size='small'
              style={{
                paddingLeft: 1,
                paddingRight: 1,
                paddingTop: 2,
                paddingBottom: 2,
                color: 'var(--foreground)',
                cursor: 'grab'
              }}
            >
              <GripVertical className='inline size-4' />
            </Button>
          </SortableTableDragHandle>
        )
      },
      width: 52,
      align: 'center',
      fixed: 'left'
    },
    {
      title: '标签',
      dataIndex: 'tag_name',
      fixed: 'left',
      align: 'center'
    },
    {
      title: '标签类型',
      render: (_, item) =>
        item.type === 1 ? '自定义标签' : item.type === 2 ? '智能标签' : '-',
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
      title: '状态',
      render: (_, item) => (item.status === 1 ? '已同步' : '未同步'),
      width: 100,
      align: 'center'
    },
    {
      title: '人数',
      render: (_, item) => item.user_num,
      width: 100,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                <Show
                  when={
                    checkActionPermission('/client/clientTags/same/tag') &&
                    item.type === 2 &&
                    item.status !== 1
                  }
                >
                  <Menu.Item key='sync'>同步</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/client/clientTags/edit/tag') &&
                    item.status === 1
                  }
                >
                  <Menu.Item key='view'>查看</Menu.Item>
                </Show>
                <Show
                  when={
                    checkActionPermission('/client/clientTags/edit/tag') &&
                    item.status !== 1 &&
                    departmentId !== 0
                  }
                >
                  <Menu.Item key='edit'>编辑</Menu.Item>
                </Show>
                <Show
                  when={checkActionPermission('/client/clientTags/del/tag')}
                >
                  <Menu.Item key='delete'>删除</Menu.Item>
                </Show>
              </Menu>
            }
          >
            <Button type='text' icon={<Ellipsis className='inline size-4' />} />
          </Dropdown>
        </div>
      ),
      width: 80,
      fixed: 'right',
      align: 'center'
    }
  ])

  if (!search.tagGroupId) {
    return (
      <TableLayout className='min-w-0'>
        <div className='flex justify-center items-center h-full text-muted-foreground text-lg'>
          请选择左侧标签组
        </div>
      </TableLayout>
    )
  }

  return (
    <TableLayout
      className='min-w-0'
      header={
        <TableLayout.Header>
          <Input
            value={tempSearch.tag_name}
            placeholder='请输入标签名称'
            style={{ width: 264 }}
            suffix={<Search className='inline size-4' />}
            onChange={(val) => updateSearchField('tag_name', val)}
            onPressEnter={commit}
          />
          <Select
            value={tempSearch.type}
            placeholder='请选择标签类型'
            style={{ width: 264 }}
            onChange={(val) => updateSearchField('type', val as 1 | 2)}
          >
            <Select.Option value={1}>自定义标签</Select.Option>
            <Select.Option value={2}>智能标签</Select.Option>
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
          {checkActionPermission('/client/clientTags/add/tag') && (
            <Button type='primary' icon={<Plus className='inline size-4' />}>
              添加标签
            </Button>
          )}
        </TableLayout.Header>
      }
    >
      <SortableTable<GetTagsRes>
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
                tagGroupId: search.tagGroupId,
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
