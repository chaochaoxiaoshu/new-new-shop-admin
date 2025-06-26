import {
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Spin
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
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  addBrand,
  deleteBrand,
  GetBrandsRes,
  getBrands,
  getDepartments,
  updateBrand
} from '@/api'
import { getBrandDetail } from '@/api/goods/get-brand-detail'
import { MyImage } from '@/components/my-image'
import { MyTable } from '@/components/my-table'
import { MyUpload, type MyUploadResource } from '@/components/my-upload'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { createMyUploadResource } from '@/helpers/upload'
import { useMyModal } from '@/hooks'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'brands'

export const Route = createFileRoute('/_protected/commodity/brand/')({
  validateSearch: type({
    'name?': 'string',
    'department_id?': 'number',
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
    getBrandsQueryOptions: () => {
      const signedDepartment = useUserStore.getState().departmentId!
      return queryOptions({
        queryKey: [LIST_KEY, search, signedDepartment],
        queryFn: () =>
          getBrands({
            ...search,
            department_id:
              signedDepartment === 0 ? search.department_id : signedDepartment
          }),
        placeholderData: keepPreviousData
      })
    }
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.getBrandsQueryOptions())
  },
  component: BrandView,
  head: () => getHead('商品品牌')
})

function BrandView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const departmentId = useUserStore((store) => store.departmentId)
  const [openModal, contextHolder] = useMyModal()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data: departments } = useQuery(context.departmentsQueryOptions)

  const { data, isFetching } = useQuery(context.getBrandsQueryOptions())

  const handleAdd = () => {
    const modalIns = openModal({
      title: '新增商品品牌',
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

  const handleEdit = (item: GetBrandsRes) => {
    const modalIns = openModal({
      title: '编辑商品品牌',
      content: (
        <EditForm
          id={item.brand_id}
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

  const { mutate: handleDelete } = useMutation({
    mutationKey: ['delete-brand'],
    mutationFn: async (item: GetBrandsRes) => {
      await deleteBrand({ brand_id: item.brand_id! })
    },
    ...getNotifs({
      key: 'delete-brand',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { columns } = defineTableColumns<GetBrandsRes>([
    {
      title: 'ID',
      dataIndex: 'brand_id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '品牌名',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true
    },
    {
      title: 'Logo',
      render: (_, item) => (
        <MyImage src={item.logo_url} width={40} height={40} />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '更新时间',
      render: (_, item) => formatDateTime(item.utime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/commodity/brand/edit')}>
            <Button type='text' onClick={() => handleEdit(item)}>
              编辑
            </Button>
          </Show>
          <Show when={checkActionPermission('/commodity/brand/del')}>
            <Popconfirm
              title='提示'
              content='确定删除吗？'
              onOk={() => handleDelete(item)}
            >
              <Button type='text'>删除</Button>
            </Popconfirm>
          </Show>
        </div>
      ),
      width: 120,
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
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入品牌名称'
                style={{ width: '264px' }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Show when={departmentId === 0}>
            <Controller
              control={control}
              name='department_id'
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
          </Show>
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
          <Show when={checkActionPermission('/commodity/brand/add')}>
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
        rowKey='brand_id'
        data={data?.items ?? []}
        columns={columns}
        loading={isFetching}
        pagination={true}
      />
      {contextHolder}
    </TableLayout>
  )
}

interface FormData {
  name?: string
  logo?: MyUploadResource[]
  sort?: number
}

interface EditFormProps {
  id?: number
  onSuccess?: () => Promise<void> | void
  onCancel?: () => void
  onError?: (error: Error) => void
}

function EditForm(props: EditFormProps) {
  const { id, onSuccess, onCancel, onError } = props
  const [form] = Form.useForm<FormData>()

  const { data: initialData, isPending: isInitialDataPending } = useQuery({
    queryKey: ['brand-detail', id],
    queryFn: () => getBrandDetail({ id: id! }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    enabled: !!id
  })
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        logo: [
          createMyUploadResource({
            id: initialData.logo,
            type: 'image',
            url: initialData.logo_url
          })
        ],
        sort: initialData.sort
      })
    }
  }, [form, initialData])

  const notifs = getNotifs({
    key: id ? 'update-brand' : 'add-brand',
    onSuccess
  })
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: [id ? 'update-brand' : 'add-brand'],
    mutationFn: async (values: FormData) => {
      if (id) {
        await updateBrand({
          ...initialData,
          ...values,
          logo: values.logo?.[0].response_id,
          logo_url: values.logo?.[0].url
        })
      } else {
        await addBrand({
          ...values,
          logo: values.logo?.[0].response_id,
          logo_url: values.logo?.[0].url,
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
    <Spin
      loading={id !== undefined && isInitialDataPending}
      style={{ display: 'block' }}
    >
      <Form
        form={form}
        disabled={isPending}
        layout='horizontal'
        labelAlign='left'
        onSubmit={handleSubmit}
      >
        <Form.Item
          field='name'
          label='品牌名称'
          rules={[{ required: true, message: '请输入品牌名称' }]}
        >
          <Input placeholder='请输入品牌名称' maxLength={20} showWordLimit />
        </Form.Item>
        <Form.Item
          field='logo'
          label='品牌Logo'
          rules={[{ required: true, message: '请上传品牌Logo' }]}
        >
          <MyUpload />
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
    </Spin>
  )
}
