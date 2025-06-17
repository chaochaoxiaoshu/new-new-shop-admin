import { type } from 'arktype'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import {
  Button,
  Form,
  Input,
  InputNumber,
  Notification,
  Popconfirm,
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

import {
  type GetAdminCategoriesRes,
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategoriesTree,
  updateAdminCategory
} from '@/api'
import { addAdminCategory } from '@/api/goods/add-admin-category'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import { TableCellWidth, defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'admin-categories'

const AdminCategoriesSearchSchema = type({
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

const adminCategoriesTreeQueryOptions = queryOptions({
  queryKey: ['admin-categories-tree'],
  queryFn: () =>
    getAdminCategoriesTree({
      department: useUserStore.getState().departmentId!
    }),
  placeholderData: keepPreviousData
})

function getAdminCategoriesQueryOptions(
  search: typeof AdminCategoriesSearchSchema.infer
) {
  return queryOptions({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getAdminCategories({
        ...search,
        department: useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute('/_protected/commodity/categoryAdmin/')({
  validateSearch: AdminCategoriesSearchSchema,
  loader: () => {
    queryClient.prefetchQuery(adminCategoriesTreeQueryOptions)
    return queryClient.ensureQueryData(
      getAdminCategoriesQueryOptions({
        page_index: 1,
        page_size: 10
      })
    )
  },
  component: AdminCategoryView,
  head: () => getHead('总部分类')
})

function AdminCategoryView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [openModal, contextHolder] = useMyModal()
  const checkActionPermisstion = useUserStore(
    (store) => store.checkActionPermisstion
  )

  const { data: adminCategoriesTree } = useQuery(
    adminCategoriesTreeQueryOptions
  )

  const { data, isFetching } = useQuery(getAdminCategoriesQueryOptions(search))

  const handleAdd = () => {
    const modalIns = openModal({
      title: '新增总部分类',
      content: (
        <EditForm
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: [LIST_KEY]
            })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 600 }
    })
  }

  const handleEdit = (item: GetAdminCategoriesRes) => {
    const modalIns = openModal({
      title: '编辑总部分类',
      content: (
        <EditForm
          initialData={item}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: [LIST_KEY]
            })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 600 }
    })
  }

  const { mutate: handleToggleVisibility } = useMutation({
    mutationKey: ['update-admin-category'],
    mutationFn: (item: GetAdminCategoriesRes) =>
      updateAdminCategory({
        ...item,
        status: item.status === 1 ? 2 : 1
      }),
    ...getNotifs({
      key: 'update-admin-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { mutate: handleDelete } = useMutation({
    mutationKey: ['delete-admin-category'],
    mutationFn: async (item: GetAdminCategoriesRes) => {
      if (adminCategoriesTree?.items.some((i) => item.parent_id === i.id)) {
        Notification.error({
          id: 'delete-admin-category',
          content: '具有子分类的总部分类无法删除'
        })
        return
      }
      await deleteAdminCategory({ id: item.id! })
    },
    ...getNotifs({
      key: 'delete-admin-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { columns } = defineTableColumns<GetAdminCategoriesRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '名称',
      render: (_, item) => (
        <Route.Link
          to={'/commodity/categoryAdmin/info'}
          search={{ id: item.id! }}
        >
          <Button type='text'>{item.name}</Button>
        </Route.Link>
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
          {checkActionPermisstion('/commodity/categoryAdmin/edit') && (
            <Button type='text' onClick={() => handleEdit(item)}>
              编辑
            </Button>
          )}
          {checkActionPermisstion('/commodity/categoryAdmin/del') && (
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
      width: 160
    }
  ])

  return (
    <TableLayout
      header={
        checkActionPermisstion('/commodity/categoryAdmin/add') && (
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

interface FormData {
  name?: string
  sort?: number
  parent_id?: number
}

interface EditFormProps {
  initialData?: FormData
  onSuccess?: () => Promise<void> | void
  onCancel?: () => void
  onError?: (error: Error) => void
}

export function EditForm(props: EditFormProps) {
  const { initialData, onSuccess, onCancel, onError } = props

  const [form] = Form.useForm<FormData>()

  const { data: adminCategoriesTreeData } = useQuery(
    adminCategoriesTreeQueryOptions
  )
  /**
   * 补充顶级分类和缩进
   */
  const finalAdminCategoriesTree = useMemo(() => {
    if (!adminCategoriesTreeData) return []
    return [
      { id: 0, name: '顶级分类', parent_id: 0 },
      ...adminCategoriesTreeData.items.map((item) => {
        if (item.parent_id === 0) {
          return { ...item, name: `|--${item.name}` }
        } else {
          return { ...item, name: `|--|--${item.name}`, disabled: true }
        }
      })
    ]
  }, [adminCategoriesTreeData])

  const notifs = getNotifs({
    key: initialData ? 'update-admin-category' : 'add-admin-category',
    onSuccess
  })
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: [initialData ? 'update-admin-category' : 'add-admin-category'],
    mutationFn: async (values: FormData) => {
      if (initialData) {
        await updateAdminCategory({
          ...initialData,
          ...values
        })
      } else {
        await addAdminCategory({
          ...values,
          status: 2,
          department: useUserStore.getState().departmentId!
        })
      }
    },
    ...notifs,
    onError: (error) => {
      notifs.onError(error)
      onError?.(error)
    }
  })

  return (
    <Form
      form={form}
      initialValues={initialData}
      disabled={isPending}
      layout='horizontal'
      labelAlign='left'
      onSubmit={handleSubmit}
    >
      <Form.Item
        field='parent_id'
        label='所属分类'
        rules={[{ required: true, message: '请选择所属分类' }]}
      >
        <Select
          options={finalAdminCategoriesTree.map((item) => ({
            value: item.id!,
            label: item.name
          }))}
          placeholder='全部'
        />
      </Form.Item>
      <Form.Item
        field='name'
        label='分类名称'
        rules={[{ required: true, message: '请输入分类名称' }]}
      >
        <Input placeholder='请输入分类名称' maxLength={20} showWordLimit />
      </Form.Item>
      <Form.Item
        field='sort'
        label='排序'
        rules={[{ required: true, message: '请输入排序' }]}
      >
        <InputNumber placeholder='请输入排序' max={65535} />
      </Form.Item>
      <div className='flex justify-end items-center space-x-4 mt-6'>
        <Button onClick={onCancel}>取消</Button>
        <Button loading={isPending} htmlType='submit' type='primary'>
          确定
        </Button>
      </div>
    </Form>
  )
}
