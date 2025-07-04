import { Button, Checkbox, Dropdown, Input, Menu } from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import {
  CheckCircle2,
  Circle,
  Ellipsis,
  RotateCcw,
  Search,
  Smartphone,
  TextCursorInput
} from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  type GetCustomersRes,
  GetTagGroupsRes,
  getCustomers,
  getTagGroups,
  setCustomerTags
} from '@/api'
import { MyImage } from '@/components/my-image'
import { MyTable } from '@/components/my-table'
import { MyTag } from '@/components/my-tag'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import {
  cn,
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'customers'

export const Route = createFileRoute('/_protected/client/account/')({
  validateSearch: type({
    'mobile?': 'string',
    'nickname?': 'string',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    customersQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getCustomers({
          ...search,
          with_fields: ['all'],
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    }),
    allTagsQueryOptions: queryOptions({
      queryKey: ['tags'],
      queryFn: () =>
        getTagGroups({ department_id: useUserStore.getState().departmentId! })
    })
  }),
  loader: async ({ context }) => {
    queryClient.prefetchQuery(context.allTagsQueryOptions)
    await queryClient.prefetchQuery(context.customersQueryOptions)
  },
  component: CustomersView,
  head: () => getHead('客户列表')
})

function CustomersView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const Link = Route.Link
  const [openModal, contextHolder] = useMyModal()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data: allTags } = useQuery(context.allTagsQueryOptions)

  const { data, isFetching } = useQuery(context.customersQueryOptions)

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
            await queryClient.invalidateQueries({
              queryKey: ['customer-info', item.id]
            })
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
        <MyImage
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
              <Show when={checkActionPermission('/client/account/editTag')}>
                <Menu.Item key='tag' onClick={() => handleSetTags(item)}>
                  打标签
                </Menu.Item>
              </Show>
              <Show when={checkActionPermission('/client/account/edit')}>
                <Link to='/client/account/detail' search={{ id: item.id! }}>
                  <Menu.Item key='view'>查看</Menu.Item>
                </Link>
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
            name='mobile'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入手机号'
                style={{ width: '264px' }}
                suffix={<Smartphone className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='nickname'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入昵称'
                style={{ width: '264px' }}
                suffix={<TextCursorInput className='inline size-4' />}
              />
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
        <div className='flex flex-col space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto'>
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
