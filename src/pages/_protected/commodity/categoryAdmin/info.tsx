import { type } from 'arktype'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import { Button, Notification, Popconfirm, Switch } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { type GetAdminSecondaryCategoriesRes, getAdminSecondaryCategories, updateAdminCategory } from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

const AdminGoodsSecondaryCategoriesSearchSchema = type({
  id: 'number',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

function getAdminGoodsSecondaryCategoriesQueryOptions(search: typeof AdminGoodsSecondaryCategoriesSearchSchema.infer) {
  return queryOptions({
    queryKey: ['admin-goods-secondary-categories', search],
    queryFn: () =>
      getAdminSecondaryCategories({
        ...search,
        department: useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute('/_protected/commodity/categoryAdmin/info')({
  validateSearch: AdminGoodsSecondaryCategoriesSearchSchema,
  component: AdminSecondaryCategoryView,
  loaderDeps: ({ search }) => ({ id: search.id }),
  loader: ({ deps }) =>
    queryClient.ensureQueryData(
      getAdminGoodsSecondaryCategoriesQueryOptions({
        id: deps.id,
        page_index: 1,
        page_size: 10
      })
    )
})

function AdminSecondaryCategoryView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, isFetching } = useQuery(getAdminGoodsSecondaryCategoriesQueryOptions(search))

  const { mutate: handleToggleVisibility } = useMutation({
    mutationKey: ['update-goods-category'],
    mutationFn: (item: GetAdminSecondaryCategoriesRes) =>
      updateAdminCategory({
        ...item,
        status: item.status === 1 ? 2 : 1
      }),
    onMutate: () => {
      Notification.info({ id: 'update-goods-category', content: '正在操作...' })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getAdminGoodsSecondaryCategoriesQueryOptions(search))
      Notification.success({ id: 'update-goods-category', content: '操作成功' })
    },
    onError: (error) => {
      Notification.error({ id: 'update-goods-category', content: `操作失败: ${error.message}` })
    }
  })

  const handleViewGoods = (item: GetAdminSecondaryCategoriesRes) => {
    // [TODO]: 查看选择商品
  }

  const handleAdd = () => {
    // [TODO]: 新增二级分类商品
  }

  const handleEdit = (item: GetAdminSecondaryCategoriesRes) => {
    // [TODO]: 编辑二级分类商品
  }

  const handleDelete = (item: GetAdminSecondaryCategoriesRes) => {
    // [TODO]: 删除二级分类商品
  }

  const { columns } = useMemo(
    () =>
      defineTableColumns<GetAdminSecondaryCategoriesRes>([
        {
          title: 'ID',
          dataIndex: 'id',
          fixed: 'left',
          width: 90,
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
          render: (_, item) => <Switch checked={item.status === 1} onChange={() => handleToggleVisibility(item)} />,
          width: 100,
          align: 'center'
        },
        {
          title: '操作',
          render: (_, item) => (
            <div className='flex justify-center items-center'>
              <Button type='text' onClick={() => handleViewGoods(item)}>
                查看选择商品
              </Button>
              <Button type='text' onClick={() => handleEdit(item)}>
                编辑
              </Button>
              <Popconfirm content='确定要删除吗？' onOk={() => handleDelete(item)}>
                <Button type='text'>删除</Button>
              </Popconfirm>
            </div>
          ),
          fixed: 'right',
          align: 'center',
          width: 280
        }
      ]),
    []
  )

  return (
    <TableLayout
      header={
        <TableLayout.Header>
          <Button type='primary' icon={<Plus className='inline size-4' />} onClick={handleAdd}>
            新增
          </Button>
        </TableLayout.Header>
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
