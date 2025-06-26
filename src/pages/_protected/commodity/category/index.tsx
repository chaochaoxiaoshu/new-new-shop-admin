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
import { type } from 'arktype'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  addGoodsCategory,
  deleteGoodsCategory,
  GetAdminCategoriesRes,
  GetGoodsCategoriesRes,
  getDepartments,
  getGoodsCategories,
  getGoodsCategoriesTree,
  updateGoodsCategory
} from '@/api'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import { defineTableColumns, queryClient, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'goods-categories'

export const Route = createFileRoute('/_protected/commodity/category/')({
  validateSearch: type({
    'name?': 'string',
    'department?': 'number',
    page_index: ['number', '=', 1],
    page_size: ['number', '=', 20]
  }),
  beforeLoad: ({ search }) => ({
    departmentsQueryOptions: queryOptions({
      queryKey: ['departments'],
      queryFn: () =>
        getDepartments({
          pageIndex: 1,
          pageSize: 9999
        })
    }),
    getGoodsCategoriesTreeQueryOptions: () => {
      const signedDepartment = useUserStore.getState().departmentId!
      return queryOptions({
        queryKey: [
          'goods-categories-tree',
          search.department,
          signedDepartment
        ],
        queryFn: () =>
          getGoodsCategoriesTree({
            department:
              signedDepartment === 0 ? search.department : signedDepartment
          }),
        placeholderData: keepPreviousData
      })
    },
    getGoodsCategoriesQueryOptions: () => {
      const signedDepartment = useUserStore.getState().departmentId!
      return queryOptions({
        queryKey: [LIST_KEY, search, signedDepartment],
        queryFn: () =>
          getGoodsCategories({
            ...search,
            department:
              signedDepartment === 0 ? search.department : signedDepartment
          }),
        placeholderData: keepPreviousData
      })
    }
  }),
  loader: async ({ context }) => {
    queryClient.prefetchQuery(context.departmentsQueryOptions)
    queryClient.prefetchQuery(context.getGoodsCategoriesTreeQueryOptions())
    await queryClient.prefetchQuery(context.getGoodsCategoriesQueryOptions())
  },
  component: GoodsCategoryView,
  head: () => getHead('商品分类')
})

function GoodsCategoryView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [openModal, contextHolder] = useMyModal()
  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data: departments } = useQuery(context.departmentsQueryOptions)
  const { data: goodsCategoriesTree } = useQuery(
    context.getGoodsCategoriesTreeQueryOptions()
  )

  const { data, isFetching } = useQuery(
    context.getGoodsCategoriesQueryOptions()
  )

  const handleAdd = () => {
    const modalIns = openModal({
      title: '新增商品分类',
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

  const handleEdit = (item: GetGoodsCategoriesRes) => {
    const modalIns = openModal({
      title: '编辑商品分类',
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
    mutationKey: ['update-goods-category'],
    mutationFn: (item: GetGoodsCategoriesRes) =>
      updateGoodsCategory({
        ...item,
        status: item.status === 1 ? 2 : 1
      }),
    ...getNotifs({
      key: 'update-goods-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { mutate: handleDelete } = useMutation({
    mutationKey: ['delete-goods-category'],
    mutationFn: async (item: GetGoodsCategoriesRes) => {
      if (goodsCategoriesTree?.items.some((i) => item.parent_id === i.id)) {
        Notification.error({
          id: 'delete-goods-category',
          content: '具有子分类的商品分类无法删除'
        })
        return
      }
      await deleteGoodsCategory({ id: item.id! })
    },
    ...getNotifs({
      key: 'delete-goods-category',
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
        <Route.Link to={'/commodity/category/info'} search={{ id: item.id! }}>
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
        <div className='actions'>
          <Show when={checkActionPermission('/commodity/category/edit')}>
            <Button type='text' onClick={() => handleEdit(item)}>
              编辑
            </Button>
          </Show>
          <Show when={checkActionPermission('/commodity/category/del')}>
            <Popconfirm
              title='提示'
              content='确定要删除吗？'
              onOk={() => handleDelete(item)}
            >
              <Button type='text'>删除</Button>
            </Popconfirm>
          </Show>
        </div>
      ),
      fixed: 'right',
      align: 'center',
      width: 120
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
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入分类名称'
                style={{ width: '264px' }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='department'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择电商事业部'
                style={{ width: '264px' }}
              >
                {departments?.items.map((item) => (
                  <Select.Option key={item.id} value={item.id!}>
                    {item.department_name}
                  </Select.Option>
                ))}
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
          <Show
            when={
              departmentId !== 0 &&
              checkActionPermission('/commodity/category/add')
            }
          >
            <Button
              type='primary'
              icon={<Plus className='inline size-4' />}
              onClick={handleAdd}
            >
              新增
            </Button>
          </Show>
        </form>
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
  const context = Route.useRouteContext()

  const [form] = Form.useForm<FormData>()

  const { data: goodsCategoriesTreeData } = useQuery(
    context.getGoodsCategoriesTreeQueryOptions()
  )
  /**
   * 补充顶级分类和缩进
   */
  const finalGoodsCategoriesTree = useMemo(() => {
    if (!goodsCategoriesTreeData) return []
    return [
      { id: 0, name: '顶级分类', parent_id: 0 },
      ...goodsCategoriesTreeData.items.map((item) => {
        if (item.parent_id === 0) {
          return { ...item, name: `|--${item.name}` }
        } else {
          return { ...item, name: `|--|--${item.name}`, disabled: true }
        }
      })
    ]
  }, [goodsCategoriesTreeData])

  const notifs = getNotifs({
    key: initialData ? 'update-goods-category' : 'add-goods-category',
    onSuccess
  })
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: [initialData ? 'update-goods-category' : 'add-goods-category'],
    mutationFn: async (values: FormData) => {
      if (initialData) {
        await updateGoodsCategory({
          ...initialData,
          ...values
        })
      } else {
        await addGoodsCategory({
          ...values,
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
          options={finalGoodsCategoriesTree.map((item) => ({
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
