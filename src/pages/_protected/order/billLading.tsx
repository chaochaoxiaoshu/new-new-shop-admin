import { Button, Form, Input, Select } from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { FileText, RotateCcw, Search, Smartphone } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import {
  type GetBillLadingsRes,
  type GetStoreListRes,
  getBillLadings,
  getStoreList,
  updateBillLading
} from '@/api'
import { GoodsInfo } from '@/components/goods-info'
import { MyTable } from '@/components/my-table'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import {
  defineTableColumns,
  formatDateTime,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores/user-store'

const LIST_KEY = 'bill-ladings'

export const Route = createFileRoute('/_protected/order/billLading')({
  validateSearch: type({
    'id?': 'string',
    'name?': 'string',
    'order_id?': 'string',
    'mobile?': 'string',
    'store_id?': 'number',
    'status?': 'number',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    billLadingsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getBillLadings({
          ...search,
          department_id: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData
    }),
    storeListQueryOptions: queryOptions({
      queryKey: ['store-list'],
      queryFn: () =>
        getStoreList({
          page_index: 1,
          page_size: 100,
          department_id: useUserStore.getState().departmentId!
        })
    })
  }),
  loader: async ({ context }) => {
    queryClient.prefetchQuery(context.storeListQueryOptions)
    await queryClient.prefetchQuery(context.billLadingsQueryOptions)
  },
  component: BillLadingView,
  head: () => getHead('提货单')
})

function BillLadingView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermission
  )
  const [openModal, contextHolder] = useMyModal()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  /* ------------------------------ Table START ------------------------------ */
  const { data: storeList } = useQuery(context.storeListQueryOptions)

  const { data, isFetching } = useQuery(context.billLadingsQueryOptions)

  const handleEdit = (item: GetBillLadingsRes) => {
    const modalIns = openModal({
      title: '编辑提货单',
      content: (
        <EditBillLadingForm
          initialValues={item}
          storeList={storeList?.items ?? []}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: [LIST_KEY]
            })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      )
    })
  }

  const { columns, totalWidth } = defineTableColumns<GetBillLadingsRes>([
    {
      title: '商品信息',
      dataIndex: 'goods_name',
      width: 420,
      align: 'center',
      render: (_, item) => (
        <div key={item.id} className='flex flex-col space-y-3 my-2'>
          {item.order_items?.map((item) => (
            <GoodsInfo
              key={item.id}
              imageUrl={item.image_url}
              name={item.name}
              price={item.price}
              quantity={item.nums}
            />
          ))}
        </div>
      )
    },
    {
      title: '提货单号',
      dataIndex: 'id',
      width: 120,
      align: 'center'
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 220,
      align: 'center'
    },
    {
      title: '提货门店',
      dataIndex: 'store_name',
      width: 160,
      ellipsis: true,
      align: 'center'
    },
    {
      title: '提货人名',
      dataIndex: 'name',
      width: 100,
      align: 'center'
    },
    {
      title: '提货电话',
      dataIndex: 'mobile',
      width: TableCellWidth.mobile,
      align: 'center'
    },
    {
      title: '提货状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status) => (status === 2 ? '已提货' : '未提货')
    },
    {
      title: '下单时间',
      dataIndex: 'ctime',
      width: 180,
      align: 'center',
      render: (_, item) => formatDateTime(item.ctime)
    },
    {
      title: '备注',
      dataIndex: 'memo',
      width: 200,
      align: 'center',
      render: (_, item) => item.order_info?.memo || '-'
    },
    {
      title: '商家备注',
      dataIndex: 'mark',
      align: 'center',
      render: (_, item) => item.order_info?.mark || '-'
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      render: (_, item) => (
        <div className='actions'>
          <Show when={checkActionPermission('/order/billLading/detail')}>
            <Button type='text' onClick={() => handleEdit(item)}>
              编辑
            </Button>
          </Show>
        </div>
      ),
      fixed: 'right'
    }
  ])
  /* ------------------------------- Table END ------------------------------- */

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
            name='id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入提货单号'
                style={{ width: '264px' }}
                suffix={<FileText className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入商品名称'
                style={{ width: '264px' }}
                suffix={<Search className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='order_id'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入订单号'
                style={{ width: '264px' }}
                suffix={<FileText className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='mobile'
            render={({ field }) => (
              <Input
                {...field}
                placeholder='请输入提货电话'
                style={{ width: '264px' }}
                suffix={<Smartphone className='inline size-4' />}
              />
            )}
          />
          <Controller
            control={control}
            name='store_id'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择门店'
                style={{ width: '264px' }}
              >
                {storeList?.items.map((store) => (
                  <Select.Option key={store.id} value={store.id!}>
                    {store.store_name}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select
                {...field}
                placeholder='请选择状态'
                style={{ width: '264px' }}
              >
                <Select.Option value={1}>未提货</Select.Option>
                <Select.Option value={2}>已提货</Select.Option>
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
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items || []}
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 200 }}
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

type EditBillLadingFormData = {
  name: string
  store_id: number
  mobile: string
}

interface EditBillLadingFormProps {
  initialValues: GetBillLadingsRes
  storeList: GetStoreListRes[]
  onSuccess: () => void
  onCancel: () => void
}

function EditBillLadingForm({
  initialValues,
  storeList,
  onSuccess,
  onCancel
}: EditBillLadingFormProps) {
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: ['update-bill-lading', initialValues.id],
    mutationFn: async (values: EditBillLadingFormData) => {
      await updateBillLading({
        id: initialValues.id!,
        name: values.name,
        store_id: values.store_id,
        mobile: values.mobile
      })
    },
    ...getNotifs({
      key: 'update-bill-lading',
      onSuccess
    })
  })

  return (
    <div>
      <Form<EditBillLadingFormData>
        initialValues={initialValues}
        layout='vertical'
        onSubmit={handleSubmit}
      >
        <Form.Item label='订单号' field='order_id' disabled>
          <Input readOnly />
        </Form.Item>
        <Form.Item label='提货单号' field='id' disabled>
          <Input readOnly />
        </Form.Item>
        <Form.Item label='提货门店' field='store_id'>
          <Select placeholder='请选择门店'>
            {storeList.map((store) => (
              <Select.Option key={store.id} value={store.id!}>
                {store.store_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='提货人名' field='name'>
          <Input placeholder='请输入提货人名' />
        </Form.Item>
        <Form.Item label='提货电话' field='mobile'>
          <Input placeholder='请输入提货电话' />
        </Form.Item>
        <Form.Item label='提货状态' field='status' disabled>
          <Select>
            <Select.Option value={1}>未提货</Select.Option>
            <Select.Option value={2}>已提货</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label='提货时间'>
          <Input
            value={
              initialValues.ptime ? formatDateTime(initialValues.ptime) : '-'
            }
            readOnly
          />
        </Form.Item>
        <Form.Item label='接待店员'>
          <Input value='-' readOnly />
        </Form.Item>
        <div className='flex justify-end items-center space-x-4 mt-6'>
          <Button onClick={onCancel}>取消</Button>
          <Button loading={isPending} htmlType='submit' type='primary'>
            确定
          </Button>
        </div>
      </Form>
    </div>
  )
}
