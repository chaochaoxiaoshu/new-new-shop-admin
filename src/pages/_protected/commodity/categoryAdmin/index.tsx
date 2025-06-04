import { type } from 'arktype'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import { Button, Notification, Popconfirm, Switch } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { type GetAdminCategoriesRes, getAdminCategories, updateAdminCategory } from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

const AdminGoodsCategoriesSearchSchema = type({
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

function getAdminGoodsCategoriesQueryOptions(search: typeof AdminGoodsCategoriesSearchSchema.infer) {
  return queryOptions({
    queryKey: ['admin-goods-categories', search],
    queryFn: () =>
      getAdminCategories({
        ...search,
        department: useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute('/_protected/commodity/categoryAdmin/')({
  validateSearch: AdminGoodsCategoriesSearchSchema,
  component: AdminCategoryView,
  loader: () =>
    queryClient.ensureQueryData(
      getAdminGoodsCategoriesQueryOptions({
        page_index: 1,
        page_size: 10
      })
    )
})

function AdminCategoryView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const Link = Route.Link

  const { data, isFetching } = useQuery(getAdminGoodsCategoriesQueryOptions(search))

  const { mutate: handleToggleVisibility } = useMutation({
    mutationKey: ['update-goods-category'],
    mutationFn: (item: GetAdminCategoriesRes) =>
      updateAdminCategory({
        ...item,
        status: item.status === 1 ? 2 : 1
      }),
    onMutate: () => {
      Notification.info({ id: 'update-goods-category', content: '正在操作...' })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(getAdminGoodsCategoriesQueryOptions(search))
      Notification.success({ id: 'update-goods-category', content: '操作成功' })
    },
    onError: (error) => {
      Notification.error({ id: 'update-goods-category', content: `操作失败: ${error.message}` })
    }
  })

  const handleAdd = () => {
    // [TODO]: 新增总部分类
  }

  const handleEdit = (item: GetAdminCategoriesRes) => {
    // [TODO]: 编辑总部分类
  }

  const handleDelete = (item: GetAdminCategoriesRes) => {
    // [TODO]: 删除总部分类
  }

  const { columns } = useMemo(
    () =>
      defineTableColumns<GetAdminCategoriesRes>([
        {
          title: 'ID',
          dataIndex: 'id',
          fixed: 'left',
          width: 90,
          align: 'center'
        },
        {
          title: '名称',
          render: (_, item) => (
            <Link to={'/commodity/categoryAdmin/info'} search={{ id: item.id! }}>
              <Button type='text'>{item.name}</Button>
            </Link>
          ),
          align: 'center'
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
          width: 160
        }
      ]),
    [Link, handleToggleVisibility]
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
