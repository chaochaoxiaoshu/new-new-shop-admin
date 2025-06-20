import { type } from 'arktype'
import { Plus } from 'lucide-react'

import { Button, Popconfirm, Switch } from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  type GetAdminSecondaryCategoriesRes,
  deleteAdminCategory,
  getAdminSecondaryCategories,
  updateAdminCategory
} from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import { TableCellWidth, defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

import { EditForm } from '.'

const LIST_KEY = 'admin-secondary-categories'

export const Route = createFileRoute(
  '/_protected/commodity/categoryAdmin/info'
)({
  validateSearch: type({
    id: 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 10]
  }),
  beforeLoad: ({ search }) => ({
    adminSecondaryCategoriesQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getAdminSecondaryCategories({
          ...search,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: ({ context }) =>
    queryClient.ensureQueryData(context.adminSecondaryCategoriesQueryOptions),
  component: AdminSecondaryCategoryView,
  head: () => getHead('总部分类/二级')
})

function AdminSecondaryCategoryView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [openModal, contextHolder] = useMyModal()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { data, isFetching } = useQuery(
    context.adminSecondaryCategoriesQueryOptions
  )

  const handleAdd = () => {
    const modalIns = openModal({
      title: '新增总部二级分类',
      content: (
        <EditForm
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 600 }
    })
  }

  const handleEdit = (item: GetAdminSecondaryCategoriesRes) => {
    const modalIns = openModal({
      title: '编辑总部二级分类',
      content: (
        <EditForm
          initialData={item}
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 600 }
    })
  }

  const { mutate: handleToggleVisibility } = useMutation({
    mutationKey: ['update-admin-secondary-category'],
    mutationFn: (item: GetAdminSecondaryCategoriesRes) =>
      updateAdminCategory({
        ...item,
        status: item.status === 1 ? 2 : 1
      }),
    ...getNotifs({
      key: 'update-admin-secondary-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { mutate: handleDelete } = useMutation({
    mutationKey: ['delete-admin-secondary-category'],
    mutationFn: async (item: GetAdminSecondaryCategoriesRes) => {
      await deleteAdminCategory({ id: item.id! })
    },
    ...getNotifs({
      key: 'delete-admin-secondary-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { columns } = defineTableColumns<GetAdminSecondaryCategoriesRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '名称',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 90,
      align: 'center'
    },
    {
      title: '是否显示',
      render: (_, item) => (
        <Switch
          checked={item.status === 1}
          onChange={() => handleToggleVisibility(item)}
        />
      ),
      width: 100,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='flex justify-center items-center'>
          <Route.Link
            to='/commodity/categoryAdmin/goods'
            search={{ goods_cat_id: item.id! }}
          >
            <Button type='text'>查看选择商品</Button>
          </Route.Link>
          {checkActionPermission('/commodity/categoryAdmin/edit/second') && (
            <Button type='text' onClick={() => handleEdit(item)}>
              编辑
            </Button>
          )}
          {checkActionPermission('/commodity/categoryAdmin/del/second') && (
            <Popconfirm
              title='提示'
              content='确定要删除吗？'
              onOk={() => handleDelete(item)}
            >
              <Button type='text'>删除</Button>
            </Popconfirm>
          )}
        </div>
      ),
      fixed: 'right',
      align: 'center',
      width: 280
    }
  ])

  return (
    <TableLayout
      header={
        checkActionPermission('/commodity/categoryAdmin/add/second') && (
          <TableLayout.Header>
            <Button
              type='primary'
              icon={<Plus className='inline size-4' />}
              onClick={handleAdd}
            >
              新增
            </Button>
          </TableLayout.Header>
        )
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
      {contextHolder}
    </TableLayout>
  )
}
