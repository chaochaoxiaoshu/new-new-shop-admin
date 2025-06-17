import { type } from 'arktype'
import { CheckCircle2, Circle, Ellipsis, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'

import {
  Button,
  Checkbox,
  Dropdown,
  Image,
  Input,
  Menu
} from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  type GetCustomersRes,
  GetTagGroupsRes,
  getCustomers,
  getTagGroups,
  setCustomerTags
} from '@/api'
import { MyTable } from '@/components/my-table'
import { MyTag } from '@/components/my-tag'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import {
  TableCellWidth,
  cn,
  defineTableColumns,
  formatDateTime,
  queryClient
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'customers'

const CustomersSearchSchema = type({
  'mobile?': 'string',
  'nickname?': 'string',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

function getCustomersQueryOptions(search: typeof CustomersSearchSchema.infer) {
  return queryOptions({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getCustomers({
        ...search,
        with_fields: ['all'],
        department: useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData
  })
}

const allTagsQueryOptions = queryOptions({
  queryKey: ['tags'],
  queryFn: () =>
    getTagGroups({ department_id: useUserStore.getState().departmentId! })
})

export const Route = createFileRoute('/_protected/client/account/')({
  validateSearch: CustomersSearchSchema,
  loader: () => {
    queryClient.prefetchQuery(allTagsQueryOptions)
    return queryClient.ensureQueryData(
      getCustomersQueryOptions({
        page_index: 1,
        page_size: 10
      })
    )
  },
  component: CustomersView,
  head: () => getHead('客户列表')
})

function CustomersView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const Link = Route.Link
  const [openModal, contextHolder] = useMyModal()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermisstion
  )

  /* ------------------------------ Search START ------------------------------ */
  const [tempSearch, setTempSearch] = useState(search)

  const handleUpdateSearchParam = <
    K extends keyof typeof CustomersSearchSchema.infer
  >(
    key: K,
    value: (typeof CustomersSearchSchema.infer)[K]
  ) => {
    setTempSearch((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    navigate({ search: tempSearch })
  }

  const handleReset = () => {
    const initial = {
      page_index: search.page_index,
      page_size: search.page_size
    }
    navigate({ search: initial })
    setTempSearch(initial)
  }
  /* ------------------------------- Search END ------------------------------- */

  const { data: allTags } = useQuery(allTagsQueryOptions)

  const { data, isFetching } = useQuery(getCustomersQueryOptions(search))

  const handleSetTags = (item: GetCustomersRes) => {
    const modalIns = openModal({
      title: '打标签',
      content: (
        <SetTagsForm
          user_id={item.id!}
          tagGroups={allTags?.groups ?? []}
          initialValues={item.tag_id?.split(',').map(Number) ?? []}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: [LIST_KEY]
            })
            // await queryClient.invalidateQueries({
            //   queryKey: ['customer-info', item.id]
            // })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      )
    })
  }

  const { columns, totalWidth } = defineTableColumns<GetCustomersRes>([
    {
      title: '头像',
      render: (_, item) => (
        <Image
          src={item.avatar}
          width={40}
          height={40}
          style={{ borderRadius: 9999, overflow: 'hidden' }}
        />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 120,
      ellipsis: true,
      align: 'center'
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
      width: TableCellWidth.mobile,
      align: 'center'
    },
    {
      title: '所属分销员昵称',
      dataIndex: 'p_nickname',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '所属分销员公司/部门',
      dataIndex: 'p_company',
      ellipsis: true,
      width: 180,
      align: 'center'
    },
    {
      title: '所属分销员手机号',
      dataIndex: 'p_mobile',
      width: TableCellWidth.mobile + 20,
      align: 'center'
    },
    {
      title: '用户身份',
      render: (_, item) => {
        const arr = []
        if (item.is_promoter === 1 || item.identity === 2) {
          arr.push('分销员')
        }
        if (item.workcode) {
          arr.push('内部员工')
        }
        if (item.identity === 1) {
          arr.push('普通员工')
        }
        return (
          <span className='truncate'>
            {arr.length > 0 ? arr.join('/') : '-'}
          </span>
        )
      },
      width: 180,
      align: 'center'
    },
    {
      title: '用户标签',
      render: (_, item) => (
        <MyTag.Group>
          {item.tag_name
            ?.split(',')
            .map((name) => (name ? <MyTag key={name} text={name} /> : null))}
        </MyTag.Group>
      ),
      width: 260,
      align: 'center'
    },
    {
      title: '累计实付金额',
      dataIndex: 'total_payed_amount',
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '累计订单数',
      dataIndex: 'total_order_num',
      width: TableCellWidth.count + 20,
      align: 'center'
    },
    {
      title: '余额',
      dataIndex: 'balance',
      width: TableCellWidth.amountL,
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
        <Dropdown
          trigger='click'
          position='br'
          droplist={
            <Menu>
              {checkActionPermission('/client/account/editTag') && (
                <Menu.Item key='tag' onClick={() => handleSetTags(item)}>
                  打标签
                </Menu.Item>
              )}
              {checkActionPermission('/client/account/edit') && (
                <Link to='/client/account/detail' search={{ id: item.id! }}>
                  <Menu.Item key='edit'>查看</Menu.Item>
                </Link>
              )}
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
        <TableLayout.Header>
          <Input
            value={tempSearch.mobile}
            placeholder='请输入手机号'
            style={{ width: '264px' }}
            onChange={(val) => handleUpdateSearchParam('mobile', val)}
          />
          <Input
            value={tempSearch.nickname}
            placeholder='请输入昵称'
            style={{ width: '264px' }}
            onChange={(val) => handleUpdateSearchParam('nickname', val)}
          />
          <Button
            type='primary'
            icon={<Search className='inline size-4' />}
            onClick={handleSearch}
          >
            查询
          </Button>
          <Button
            type='outline'
            icon={<RotateCcw className='inline size-4' />}
            onClick={handleReset}
          >
            重置
          </Button>
        </TableLayout.Header>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        loading={isFetching}
        columns={columns}
        scroll={{ x: totalWidth + 140 }}
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

type Tag = GetTagGroupsRes['tags'][number]

interface SetTagsFormProps {
  user_id: number
  tagGroups: GetTagGroupsRes[]
  initialValues: number[]
  onSuccess?: () => Promise<void> | void
  onCancel?: () => void
  onError?: (error: Error) => void
}

function SetTagsForm(props: SetTagsFormProps) {
  const { user_id, tagGroups, initialValues, onSuccess, onCancel, onError } =
    props
  const flatTags = tagGroups.map((group) => group.tags).flat()
  const initialTags = initialValues
    .map((id) => flatTags.find((tag) => tag.id === id))
    .filter(Boolean) as Tag[]

  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags)

  const handleSetTags = (ids: number[]) => {
    setSelectedTags(flatTags.filter((tag) => ids.includes(tag.id)))
  }

  const notifs = getNotifs({ key: 'set-tags', onSuccess })
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: ['set-tags'],
    mutationFn: () =>
      setCustomerTags({
        tag_id: selectedTags.map((tag) => tag.id),
        user_id: user_id
      }),
    ...notifs,
    onError: (error) => {
      notifs.onError(error)
      onError?.(error)
    }
  })

  return (
    <>
      <Checkbox.Group
        value={selectedTags.map((tag) => tag.id)}
        onChange={(value) => handleSetTags(value)}
      >
        <div className='flex flex-col space-y-2'>
          {tagGroups.map((group) => (
            <div key={group.id} className='flex flex-col space-y-2'>
              <span className='text-sm text-muted-foreground'>
                {group.tags.length > 0 && group.group_name}
              </span>
              <div className='grid grid-cols-2 gap-y-2'>
                {group.tags.map((tag) => (
                  <Checkbox
                    key={tag.id}
                    value={tag.id}
                    style={{ marginRight: 8, paddingLeft: 0 }}
                  >
                    {({ checked }) => (
                      <div
                        className={cn(
                          'flex items-center space-x-2 pl-4 pr-8 py-2 rounded-md border',
                          checked && 'border-accent'
                        )}
                      >
                        {checked ? (
                          <CheckCircle2
                            className='inline size-4 text-accent'
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Circle
                            className='inline size-4 text-border'
                            strokeWidth={2.5}
                          />
                        )}
                        <span className='flex-auto'>{tag.tag_name}</span>
                      </div>
                    )}
                  </Checkbox>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Checkbox.Group>
      <div className='flex justify-end items-center space-x-4 mt-6'>
        <Button onClick={onCancel}>取消</Button>
        <Button
          loading={isPending}
          type='primary'
          onClick={() => handleSubmit()}
        >
          确定
        </Button>
      </div>
    </>
  )
}
