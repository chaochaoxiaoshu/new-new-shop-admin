import {
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Notification,
  Radio,
  Select,
  Space,
  Switch
} from '@arco-design/web-react'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { Edit, GripVertical, Plus, Trash2 } from 'lucide-react'
import {
  addGoods,
  editGoods,
  getAdminCategoriesTree,
  getBrands,
  getGoodsCategoriesTree,
  getGoodsDetail,
  getGoodsDisease,
  getGoodsDrugstores,
  getShipTemplates
} from '@/api'
import { BaseLayout } from '@/components/base-layout'
import { MyUpload, MyUploadResource } from '@/components/my-upload'
import { SectionTitle } from '@/components/section-title'
import { Show } from '@/components/show'
import { SortableTable } from '@/components/sortable-table'
import { SortableTableDragHandle } from '@/components/sortable-table/drag-handle'
import { WithAsterisk } from '@/components/with-asterisk'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import { cn, defineTableColumns, generateId, queryClient } from '@/lib'
import { useUserStore } from '@/stores'
import { b2f, f2b } from './-adpater'
import { category, dosage } from './-constants'
import { DeliveryType, GoodsFormData, IsRx, Product } from './-definition'

export const Route = createFileRoute(
  '/_protected/commodity/merchandiseCon/detail/'
)({
  validateSearch: type({
    'goods_id?': 'number',
    type: '"add" | "edit" | "copy" | "view"'
  }),
  loaderDeps: ({ search }) => ({ goods_id: search.goods_id }),
  beforeLoad: ({ search }) => ({
    goodsDetailQueryOptions: queryOptions({
      queryKey: ['goods-detail', search.goods_id],
      queryFn: () => getGoodsDetail({ id: search.goods_id }),
      enabled: !!search.goods_id
    }),
    adminCategoriesTreeQueryOptions: queryOptions({
      queryKey: ['admin-categories-tree'],
      queryFn: () =>
        getAdminCategoriesTree({
          department: useUserStore.getState().departmentId!
        })
    }),
    goodsCategoriesTreeQueryOptions: queryOptions({
      queryKey: ['goods-categories-tree'],
      queryFn: () =>
        getGoodsCategoriesTree({
          department: useUserStore.getState().departmentId!
        })
    }),
    brandsQueryOptions: queryOptions({
      queryKey: ['brands'],
      queryFn: () =>
        getBrands({ department_id: useUserStore.getState().departmentId! })
    }),
    goodsDiseaseQueryOptions: queryOptions({
      queryKey: ['goods-disease'],
      queryFn: () => getGoodsDisease()
    }),
    goodsDrugstoresQueryOptions: queryOptions({
      queryKey: ['goods-drugstores'],
      queryFn: () => getGoodsDrugstores()
    }),
    shipTemplatesQueryOptions: queryOptions({
      queryKey: ['ship-templates'],
      queryFn: () =>
        getShipTemplates({
          department: useUserStore.getState().departmentId!,
          page_index: 1,
          page_size: 100
        })
    })
  }),
  loader: async ({ context }) => {
    queryClient.prefetchQuery(context.adminCategoriesTreeQueryOptions)
    queryClient.prefetchQuery(context.goodsCategoriesTreeQueryOptions)
    queryClient.prefetchQuery(context.brandsQueryOptions)
    queryClient.prefetchQuery(context.goodsDiseaseQueryOptions)
    queryClient.prefetchQuery(context.goodsDrugstoresQueryOptions)
    queryClient.prefetchQuery(context.shipTemplatesQueryOptions)
    await queryClient.prefetchQuery(context.goodsDetailQueryOptions)
  },
  component: GoodsEditView,
  head: () => getHead('添加/编辑商品')
})

/* ------------------------------- 表单初始值 START ------------------------------ */
const initialFormData: GoodsFormData = {
  is_rx: IsRx.非药品,
  try_disease: [''],
  medicine_tips: [
    { key: '主治功能', value: '' },
    { key: '用法用量', value: '' }
  ],
  parameters: [],
  rx_parameters: [
    { key: '通用名', value: '' },
    { key: '商品名', value: '' },
    { key: '英文名', value: '' },
    { key: '拼音简称', value: '' },
    { key: '类别', value: void 0 },
    { key: '剂型', value: void 0 },
    { key: '性状', value: '' },
    { key: '规格', value: '' },
    { key: '包装单位', value: '' },
    { key: '适用人群', value: '' },
    { key: '禁忌症', value: '' },
    { key: '不良反应', value: '' },
    { key: '贮藏', value: '' },
    { key: '注意事项', value: '' },
    { key: '有效期', value: '' },
    { key: '批准文号', value: '' },
    { key: '生产企业', value: '' }
  ],
  delivery_type: DeliveryType.快递发货,
  images: [],
  videos: [],
  products: [
    {
      temp_id: generateId(),
      sort: 1,
      is_default: 1,
      is_lnternal: 2,
      is_member_price: 2,
      spes_desc: '',
      spes_nums: 1,
      marketable: 1
    }
  ],
  is_purchase: 2,
  marketable: 1,
  is_recommend: 2,
  is_hot: 2,
  is_approve: 2,
  is_hidelinks: 2
}
/* -------------------------------- 表单初始值 END ------------------------------- */

function GoodsEditView() {
  const [form] = Form.useForm<GoodsFormData>()
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [openModal, contextHolder] = useMyModal()

  /* ------------------------------- 数据请求 START ------------------------------- */
  const { data: goodsDetail } = useQuery(context.goodsDetailQueryOptions)
  const initialValues = goodsDetail ? b2f(goodsDetail) : initialFormData

  const { data: adminCategoriesTreeData } = useQuery({
    ...context.adminCategoriesTreeQueryOptions,
    select: (data) => {
      return data.items.map((item) => {
        if (item.parent_id === 0) {
          return { ...item, name: `|--${item.name}`, disabled: true }
        } else {
          return { ...item, name: `|--|--${item.name}`, disabled: false }
        }
      })
    }
  })

  const { data: goodsDepartypeData } = useQuery({
    ...context.goodsCategoriesTreeQueryOptions,
    select: (data) => {
      return data.items.map((item) => {
        if (item.parent_id === 0) {
          return { ...item, name: `|--${item.name}`, disabled: true }
        } else {
          return { ...item, name: `|--|--${item.name}`, disabled: false }
        }
      })
    }
  })

  const { data: brandsData } = useQuery(context.brandsQueryOptions)
  const { data: goodsDiseaseData } = useQuery(context.goodsDiseaseQueryOptions)
  const { data: goodsDrugstoresData } = useQuery(
    context.goodsDrugstoresQueryOptions
  )
  const { data: shipTemplatesData } = useQuery(
    context.shipTemplatesQueryOptions
  )
  /* -------------------------------- 数据请求 END -------------------------------- */

  /* ------------------------------- 表单数据 START ------------------------------- */
  const isRx = Form.useWatch('is_rx', form as FormInstance) as IsRx
  const products = Form.useWatch('products', form as FormInstance) as Product[]

  const handleSetMainImage = (item: MyUploadResource) => {
    const images = form.getFieldValue('images') as MyUploadResource[]
    form.setFieldValue(
      'images',
      images.map((image) => {
        if (image.id === item.id) {
          return { ...image, payload: { ...image.payload, is_main: 1 } }
        } else {
          return { ...image, payload: { ...image.payload, is_main: 0 } }
        }
      })
    )
  }

  const handleAddProduct = () => {
    form.setFieldValue('products', [
      ...products,
      {
        temp_id: generateId(),
        sort: products.length + 1,
        is_default: 2,
        is_lnternal: 2,
        is_member_price: 2,
        spes_desc: '',
        spes_nums: 1,
        marketable: 1
      }
    ])
  }

  const handleDeleteProduct = (temp_id?: string) => {
    if (!temp_id) return
    form.setFieldValue(
      'products',
      products.filter((item) => item.temp_id !== temp_id)
    )
  }

  const handleSetDefaultProduct = (temp_id?: string) => {
    if (!temp_id) return
    form.setFieldValue(
      'products',
      products.map((item) => {
        if (item.temp_id === temp_id) {
          return { ...item, is_default: 1 }
        } else {
          return { ...item, is_default: 2 }
        }
      })
    )
  }

  const handleProductChange = ({
    temp_id,
    field,
    value
  }: {
    temp_id?: string
    field: keyof Product
    value: unknown
  }) => {
    if (!temp_id) return
    form.setFieldValue(
      'products',
      products.map((item) => {
        if (item.temp_id === temp_id) {
          return { ...item, [field]: value }
        } else {
          return item
        }
      })
    )
  }

  const handleSetProductName = (temp_id?: string, value?: string) => {
    let tempValue = value || ''

    const modalIns = openModal({
      title: '设置规格名',
      content: (
        <div className='flex flex-col'>
          <Input.TextArea
            rows={5}
            placeholder='请输入规格名'
            defaultValue={tempValue}
            onChange={(value) => (tempValue = value)}
          />
          <div className='flex justify-end items-center space-x-4 mt-6'>
            <Button onClick={() => modalIns?.close()}>取消</Button>
            <Button
              type='primary'
              onClick={() => {
                handleProductChange({
                  temp_id,
                  field: 'spes_desc',
                  value: tempValue
                })
                modalIns?.close()
              }}
            >
              确定
            </Button>
          </div>
        </div>
      )
    })
  }

  const handleBatchSet = (
    field: keyof Product,
    type: 'string' | 'number',
    precision = 2,
    condition: (item: Product) => boolean = () => true
  ) => {
    let tempValue = type === 'number' ? 0 : ''

    const modalIns = openModal({
      title: '设置库存',
      content: (
        <div className='flex flex-col'>
          {type === 'number' ? (
            <InputNumber
              placeholder='请输入'
              defaultValue={tempValue}
              precision={precision}
              onChange={(value) => (tempValue = value)}
            />
          ) : (
            <Input
              placeholder='请输入'
              defaultValue={tempValue as string}
              onChange={(value) => (tempValue = value)}
            />
          )}
          <div className='flex justify-end items-center space-x-4 mt-6'>
            <Button onClick={() => modalIns?.close()}>取消</Button>
            <Button
              type='primary'
              onClick={() => {
                form.setFieldValue(
                  'products',
                  products.map((item) => {
                    if (condition(item)) {
                      return { ...item, [field]: tempValue }
                    } else {
                      return item
                    }
                  })
                )
                modalIns?.close()
              }}
            >
              确定
            </Button>
          </div>
        </div>
      )
    })
  }
  /* -------------------------------- 表单数据 END -------------------------------- */

  /* ------------------------------- 表格列定义 START ------------------------------ */
  const { columns: productsColumns, totalWidth } = defineTableColumns<Product>([
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
      title: '是否默认',
      render: (_, item, index) => (
        <>
          {/* 放在这，不然受控表单不收集这些值 */}
          <Show when={search.type !== 'add'}>
            <Form.Item field={`products[${index}].id`} noStyle>
              <span style={{ display: 'none' }}>{item.id}</span>
            </Form.Item>
          </Show>
          <Form.Item field={`products[${index}].sort`} noStyle>
            <span style={{ display: 'none' }}>{item.sort}</span>
          </Form.Item>
          <Form.Item field={`products[${index}].marketable`} noStyle>
            <span style={{ display: 'none' }}>{item.marketable}</span>
          </Form.Item>
          {/* 这个才是真的值 */}
          <Form.Item field={`products[${index}].is_default`}>
            <Radio
              checked={item.is_default === 1}
              onChange={() => handleSetDefaultProduct(item.temp_id)}
            >
              默认
            </Radio>
          </Form.Item>
        </>
      ),
      width: 100,
      align: 'center'
    },
    {
      title: <WithAsterisk>规格名</WithAsterisk>,
      render: (_, item, index) => (
        <Form.Item
          field={`products[${index}].spes_desc`}
          rules={[{ required: true, message: '请输入规格名' }]}
        >
          <Input
            placeholder='规格名'
            suffix={
              <Button
                type='text'
                shape='round'
                icon={<Edit className='inline size-4' />}
                onClick={() =>
                  handleSetProductName(item.temp_id, item.spes_desc)
                }
              />
            }
          />
        </Form.Item>
      ),
      align: 'center'
    },
    {
      title: <WithAsterisk>规格值</WithAsterisk>,
      render: (_, _item, index) => {
        const is_rx = form.getFieldValue('is_rx')
        return (
          <Form.Item
            field={`products[${index}].spes_nums`}
            rules={[{ required: true, message: '请输入规格值' }]}
          >
            <InputNumber
              disabled={is_rx !== IsRx.处方药}
              placeholder='规格值'
              min={0}
              step={1}
            />
          </Form.Item>
        )
      },
      width: 120,
      align: 'center'
    },
    {
      title: '图片',
      render: (_, _item, index) => (
        <Form.Item
          field={`products[${index}].image`}
          formatter={(value) => (value ? [value] : undefined)}
          getValueFromEvent={(value: string[]) => value[0]}
        >
          <MyUpload className='size-[64px] mx-auto' itemSize={64} />
        </Form.Item>
      ),
      width: 100,
      align: 'center'
    },
    {
      title: '货号',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].sn`}>
          <Input placeholder='货号' readOnly />
        </Form.Item>
      ),
      width: 180,
      align: 'center'
    },
    {
      title: <WithAsterisk>库存</WithAsterisk>,
      render: (_, _item, index) => (
        <Form.Item
          field={`products[${index}].stock`}
          rules={[{ required: true, message: '请输入库存' }]}
        >
          <InputNumber
            placeholder='库存'
            min={0}
            step={1}
            parser={(value: string) => Number(value)}
          />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '冻结库存',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].freeze_stock`}>
          <InputNumber placeholder='冻结库存' min={0} step={1} readOnly />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: <WithAsterisk>销售价</WithAsterisk>,
      render: (_, _item, index) => (
        <Form.Item
          field={`products[${index}].price`}
          rules={[{ required: true, message: '请输入销售价' }]}
        >
          <InputNumber placeholder='销售价' min={0} precision={2} step={0.01} />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '成本价',
      render: (_, _item, index) => (
        <Form.Item
          field={`products[${index}].costprice`}
          rules={[{ required: true, message: '请输入成本价' }]}
        >
          <InputNumber placeholder='成本价' min={0} precision={2} step={0.01} />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '供货成本价',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].supplyprice`}>
          <InputNumber
            placeholder='供货成本价'
            min={0}
            precision={2}
            step={0.01}
          />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '划线价',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].mktprice`}>
          <InputNumber placeholder='划线价' min={0} precision={2} step={0.01} />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '是否支持内购',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].is_lnternal`}>
          <Select disabled={isRx === IsRx.处方药} placeholder='内购'>
            <Select.Option value={1}>是</Select.Option>
            <Select.Option value={2}>否</Select.Option>
          </Select>
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '内购价',
      render: (_, item, index) => (
        <Form.Item field={`products[${index}].internal_price`}>
          <InputNumber
            disabled={item.is_lnternal !== 1}
            placeholder='内购价'
            min={0}
            precision={2}
            step={0.01}
          />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '是否支持会员价',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].is_member_price`}>
          <Select placeholder='会员价'>
            <Select.Option value={1}>是</Select.Option>
            <Select.Option value={2}>否</Select.Option>
          </Select>
        </Form.Item>
      ),
      width: 140,
      align: 'center'
    },
    {
      title: <WithAsterisk>重量</WithAsterisk>,
      render: (_, _item, index) => (
        <Form.Item
          field={`products[${index}].weight`}
          rules={[{ required: true, message: '请输入重量' }]}
        >
          <InputNumber placeholder='重量' min={0} precision={2} step={0.01} />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '单位',
      render: (_, _item, index) => (
        <Form.Item field={`products[${index}].unit`}>
          <Input placeholder='单位' />
        </Form.Item>
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className={cn('actions', item.is_default === 1 && 'opacity-40')}>
          <Button
            disabled={item.is_default === 1}
            type='text'
            onClick={() => handleDeleteProduct(item.temp_id)}
          >
            删除
          </Button>
          <Button
            disabled={item.is_default === 1}
            type='text'
            onClick={() =>
              handleProductChange({
                temp_id: item.temp_id,
                field: 'marketable',
                value: item.marketable === 1 ? 2 : 1
              })
            }
          >
            {item.marketable === 1 ? '下架' : '上架'}
          </Button>
        </div>
      ),
      width: 160,
      align: 'center',
      fixed: 'right'
    }
  ])
  /* -------------------------------- 表格列定义 END ------------------------------- */

  const handleCancel = () => {
    navigate({ to: '/commodity/merchandiseCon', replace: true })
  }

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: ['goods-edit'],
    mutationFn: (values: GoodsFormData) => {
      if (search.type === 'add' || search.type === 'copy') {
        const transformedValues = f2b(values, {
          departmentId: useUserStore.getState().departmentId!,
          goodsDisease: goodsDiseaseData?.items ?? []
        })
        return addGoods(transformedValues)
      } else {
        const transformedValues = f2b(values, {
          id: goodsDetail?.id,
          departmentId: useUserStore.getState().departmentId!,
          goodsDisease: goodsDiseaseData?.items ?? []
        })
        return editGoods(transformedValues)
      }
    },
    ...getNotifs({
      key: 'goods-edit',
      onSuccess: () => {
        Notification.success({ content: '保存成功' })
        queryClient.invalidateQueries({
          queryKey: ['goods-detail', search.goods_id]
        })
        queryClient.invalidateQueries({ queryKey: ['goods'] })
        navigate({ to: '/commodity/merchandiseCon', replace: true })
      }
    })
  })

  return (
    <BaseLayout>
      <Form
        form={form}
        initialValues={initialValues}
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 10 }}
        style={{ width: 720 }}
        onSubmit={handleSubmit}
      >
        <SectionTitle>基础信息</SectionTitle>
        <Form.Item
          field='is_rx'
          label='商品属性'
          rules={[{ required: true, message: '请选择商品属性' }]}
        >
          <Select placeholder='请选择商品属性'>
            <Select.Option value={IsRx.非药品}>非药品</Select.Option>
            <Select.Option value={IsRx.处方药}>处方药</Select.Option>
            <Select.Option value={IsRx.非处方药}>非处方药</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          field='goods_cat_id'
          label='总部分类'
          rules={[{ required: true, message: '请选择总部分类' }]}
        >
          <Select placeholder='全部'>
            {adminCategoriesTreeData?.map((item) => (
              <Select.Option
                key={item.id}
                value={item.id!}
                disabled={item.disabled}
              >
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          field='name'
          label='商品名称'
          rules={[{ required: true, message: '请输入商品名称' }]}
        >
          <Input placeholder='请输入商品名称' maxLength={20} showWordLimit />
        </Form.Item>
        <Form.Item field='goods_departype_id' label='商品分类'>
          <Select placeholder='全部'>
            {goodsDepartypeData?.map((item) => (
              <Select.Option
                key={item.id}
                value={item.id!}
                disabled={item.disabled}
              >
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item field='brand_id' label='商品品牌'>
          <Select placeholder='全部'>
            {brandsData?.items.map((item) => (
              <Select.Option key={item.brand_id} value={item.brand_id!}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, next) => prev.is_rx !== next.is_rx}
          noStyle
        >
          {(values: GoodsFormData) => {
            const formItems: React.ReactNode[] = []
            if (values.is_rx === IsRx.处方药) {
              formItems.push(
                <Form.List
                  key='try_disease'
                  field='try_disease'
                  rules={[
                    {
                      validator: (v, cb) => {
                        if (v?.length === 0) return cb('请输入适用疾病')
                        v?.forEach((item: string) => {
                          if (!item.trim()) return cb('请输入适用疾病')
                        })
                        cb()
                      }
                    }
                  ]}
                  noStyle
                >
                  {(fields, { add, remove }) =>
                    fields.map((item, index) => (
                      <div key={item.key} className='relative'>
                        <Form.Item
                          field={item.field}
                          label={`适用疾病${index === 0 ? '' : index + 1}`}
                          labelCol={{ span: 4 }}
                          wrapperCol={{ span: 10 }}
                          rules={[
                            { required: true, message: '请输入适用疾病' }
                          ]}
                        >
                          <Select placeholder='全部' showSearch>
                            {goodsDiseaseData?.items.map((item) => (
                              <Select.Option key={item.id} value={item.id!}>
                                {item.icd_name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div className='absolute left-[440px] top-0'>
                          {index === 0 ? (
                            <Button
                              type='primary'
                              shape='circle'
                              icon={<Plus className='inline size-4' />}
                              onClick={() => add()}
                            />
                          ) : (
                            <Button
                              shape='circle'
                              status='danger'
                              icon={<Trash2 className='inline size-4' />}
                              onClick={() => remove(index)}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  }
                </Form.List>
              )
            }
            if (values.is_rx === IsRx.处方药) {
              formItems.push(
                <Form.Item
                  key='drugstore_id'
                  field='drugstore_id'
                  label='药店'
                  rules={[{ required: true, message: '请选择药店' }]}
                >
                  <Select placeholder='全部'>
                    {goodsDrugstoresData?.items.map((item) => (
                      <Select.Option key={item.id} value={item.id!}>
                        {item.drugstore_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }
            if (
              values.is_rx === IsRx.处方药 ||
              values.is_rx === IsRx.非处方药
            ) {
              formItems.push(
                <Form.Item key='medicine_tips' label='用药提示'>
                  <Form.List
                    field='medicine_tips'
                    rules={[
                      {
                        validateTrigger: 'onChange',
                        validator: (v, cb) => {
                          if (v?.length === 0) return cb('请输入用药提示')
                          v?.forEach((item: { value: string }) => {
                            if (!item.value.trim()) return cb('请输入用药提示')
                          })
                          cb()
                        }
                      }
                    ]}
                  >
                    {(fields) => {
                      return (
                        <div className='flex flex-col space-y-2'>
                          {fields.map((item) => (
                            <div key={item.key} className='flex items-center'>
                              <Form.Item field={`${item.field}.key`} noStyle>
                                <Input style={{ width: 110 }} readOnly />
                              </Form.Item>
                              <Form.Item field={`${item.field}.value`} noStyle>
                                <Input placeholder='请输入参数值' />
                              </Form.Item>
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  </Form.List>
                </Form.Item>
              )
            }
            return <>{...formItems}</>
          }}
        </Form.Item>
        <Form.Item
          label='商品参数'
          rules={[{ required: true }]}
          shouldUpdate={(prev, next) => prev.is_rx !== next.is_rx}
          style={{ marginBottom: 0 }}
        >
          {(values: GoodsFormData) => {
            if (values.is_rx === IsRx.非药品) {
              return (
                <Form.List
                  field='parameters'
                  rules={[
                    {
                      validateTrigger: 'onChange',
                      validator: (v, cb) => {
                        if (v?.length === 0) return cb('请输入商品参数')
                        v?.forEach((item: { key?: string; value?: string }) => {
                          if (!item.key?.trim() || !item.value?.trim())
                            return cb('请输入商品参数')
                        })
                        cb()
                      }
                    }
                  ]}
                >
                  {(fields, { add, remove }) => {
                    return (
                      <div className='flex flex-col space-y-2'>
                        {fields.map((item, index) => (
                          <div key={item.key} className='flex items-center'>
                            <Form.Item field={`${item.field}.key`} noStyle>
                              <Input
                                style={{ width: 110 }}
                                placeholder='请输入'
                              />
                            </Form.Item>
                            <Form.Item field={`${item.field}.value`} noStyle>
                              <Input
                                placeholder='请输入参数值'
                                suffix={
                                  <Button
                                    type='text'
                                    shape='round'
                                    size='small'
                                    icon={<Trash2 className='inline size-3' />}
                                    onClick={() => remove(index)}
                                  />
                                }
                              />
                            </Form.Item>
                          </div>
                        ))}
                        <Button
                          icon={<Plus className='inline size-4' />}
                          onClick={() => add({ key: '', value: '' })}
                        >
                          添加参数
                        </Button>
                      </div>
                    )
                  }}
                </Form.List>
              )
            } else {
              return (
                <Form.List
                  field='rx_parameters'
                  rules={[
                    {
                      validateTrigger: 'onChange',
                      validator: (v, cb) => {
                        if (v?.length === 0) return cb('请输入商品参数')
                        v?.forEach((item: { key?: string; value?: string }) => {
                          if (!item.key?.trim() || !item.value?.trim())
                            return cb('请输入商品参数')
                        })
                        cb()
                      }
                    }
                  ]}
                >
                  {(fields, { add, remove }) => {
                    const fieldValues = form.getFieldValue(
                      'rx_parameters'
                    ) as GoodsFormData['rx_parameters']
                    return (
                      <div className='flex flex-col space-y-2'>
                        {fields.map((item, index) => (
                          <div key={item.key} className='flex items-center'>
                            <Form.Item field={`${item.field}.key`} noStyle>
                              <Input
                                style={{ width: 110 }}
                                readOnly={initialFormData.rx_parameters.some(
                                  (i) => i.key === fieldValues[index].key
                                )}
                                placeholder='请输入'
                              />
                            </Form.Item>
                            <Form.Item field={`${item.field}.value`} noStyle>
                              {fieldValues[index].key === '类别' ? (
                                <Select placeholder='请选择类别'>
                                  {category.map((item) => (
                                    <Select.Option
                                      key={item.value}
                                      value={item.value}
                                    >
                                      {item.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              ) : fieldValues[index].key === '剂型' ? (
                                <Select placeholder='请选择剂型'>
                                  {dosage.map((item) => (
                                    <Select.Option
                                      key={item.value}
                                      value={item.value}
                                    >
                                      {item.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              ) : (
                                <Input
                                  placeholder='请输入参数值'
                                  suffix={
                                    <Show
                                      when={
                                        !initialFormData.rx_parameters.some(
                                          (i) =>
                                            i.key === fieldValues[index].key
                                        )
                                      }
                                    >
                                      <Button
                                        type='text'
                                        shape='round'
                                        size='small'
                                        icon={
                                          <Trash2 className='inline size-3' />
                                        }
                                        onClick={() => remove(index)}
                                      />
                                    </Show>
                                  }
                                />
                              )}
                            </Form.Item>
                          </div>
                        ))}
                        <Button
                          icon={<Plus className='inline size-4' />}
                          onClick={() => add({ key: '', value: '' })}
                        >
                          添加参数
                        </Button>
                      </div>
                    )
                  }}
                </Form.List>
              )
            }
          }}
        </Form.Item>
        <Form.Item
          field='delivery_type'
          label='配送方式'
          rules={[{ required: true, message: '请选择配送方式' }]}
        >
          <Radio.Group>
            <Space direction='horizontal' style={{ width: 500 }}>
              <Radio value={DeliveryType.快递发货}>快递发货</Radio>
              <Radio value={DeliveryType.到店自提}>到店自提</Radio>
              <Radio value={DeliveryType['快递发货/到店自提']}>
                快递发货/到店自提
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, next) =>
            prev.delivery_type !== next.delivery_type
          }
          noStyle
        >
          {(values: GoodsFormData) => {
            if (
              values.delivery_type === DeliveryType.快递发货 ||
              values.delivery_type === DeliveryType['快递发货/到店自提']
            ) {
              return (
                <Form.Item
                  field='ship_id'
                  label='运费模板'
                  rules={[{ required: true, message: '请选择运费模板' }]}
                >
                  <Select placeholder='请选择运费模板'>
                    {shipTemplatesData?.items.map((item) => (
                      <Select.Option key={item.id} value={item.id!}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }
          }}
        </Form.Item>
        <Form.Item field='brief' label='商品简介'>
          <Input.TextArea rows={3} placeholder='请输入商品简介' />
        </Form.Item>
        <Form.Item
          field='images'
          label='商品图片'
          rules={[{ required: true, message: '请上传商品图片' }]}
        >
          <MyUpload
            multiple
            limit={Infinity}
            accept='image'
            renderOverlay={(item) => (
              <>
                {item.payload?.is_main === 1 ? (
                  <div className='absolute left-1 bottom-1 text-xs text-white bg-accent px-1.5 py-0.5 rounded-md'>
                    主图
                  </div>
                ) : (
                  <div
                    className='absolute left-1 bottom-1 text-xs text-white bg-accent px-1.5 py-0.5 rounded-md hidden group-hover:block'
                    onClick={() => handleSetMainImage(item)}
                  >
                    设为主图
                  </div>
                )}
              </>
            )}
          />
        </Form.Item>
        <Form.Item field='videos' label='商品视频'>
          <MyUpload multiple limit={Infinity} accept='video' />
        </Form.Item>
        <SectionTitle>销售信息</SectionTitle>
        <Form.Item shouldUpdate={true} noStyle>
          <SortableTable<Product>
            rowKey='temp_id'
            data={products}
            columns={productsColumns}
            scroll={{ x: totalWidth + 240 }}
            borderCell
            hover={false}
            pagination={false}
            footer={() => (
              <Button
                type='outline'
                icon={<Plus className='inline size-4' />}
                onClick={handleAddProduct}
              >
                添加规格
              </Button>
            )}
            style={{ marginBottom: 20 }}
            onSort={(newVals) => form.setFieldValue('products', newVals)}
          />
        </Form.Item>
        <Form.Item label='批量设置'>
          <div className='flex items-center'>
            <Button
              type='text'
              onClick={() => handleBatchSet('stock', 'number', 0)}
            >
              库存
            </Button>
            <Button
              type='text'
              onClick={() => handleBatchSet('price', 'number')}
            >
              销售价
            </Button>
            <Button
              type='text'
              onClick={() => handleBatchSet('costprice', 'number')}
            >
              成本价
            </Button>
            <Button
              type='text'
              onClick={() => handleBatchSet('mktprice', 'number')}
            >
              划线价
            </Button>
            <Button
              type='text'
              onClick={() =>
                handleBatchSet(
                  'internal_price',
                  'number',
                  2,
                  (item) => item.is_lnternal === 1
                )
              }
            >
              内购价
            </Button>
            <Button
              type='text'
              onClick={() => handleBatchSet('weight', 'number')}
            >
              重量
            </Button>
            <Button
              type='text'
              onClick={() => handleBatchSet('unit', 'string')}
            >
              单位
            </Button>
          </div>
        </Form.Item>
        <SectionTitle>其他信息</SectionTitle>
        <Form.Item
          field='is_purchase'
          label='限购'
          triggerPropName='checked'
          formatter={(value) => value === 1}
          getValueFromEvent={(value) => (value ? 1 : 2)}
        >
          <Switch />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {(fields: GoodsFormData) => {
            if (fields.is_purchase === 1) {
              return (
                <Form.Item label='限购数量' required>
                  <div className='flex items-start space-x-2'>
                    <Form.Item
                      field='purchase_name'
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      <Select placeholder='请选择' style={{ width: 100 }}>
                        <Select.Option value={1}>终身</Select.Option>
                        <Select.Option value={2}>每年</Select.Option>
                        <Select.Option value={3}>每月</Select.Option>
                        <Select.Option value={4}>每天</Select.Option>
                      </Select>
                    </Form.Item>
                    <span className='flex-none leading-[32px]'>限购</span>
                    <Form.Item
                      field='purchase_num'
                      rules={[{ required: true, message: '请输入限购件数' }]}
                    >
                      <Input
                        placeholder='请输入限购件数'
                        style={{ width: 140 }}
                      />
                    </Form.Item>
                    <span className='flex-none leading-[32px]'>件</span>
                  </div>
                </Form.Item>
              )
            }
            return null
          }}
        </Form.Item>
        <Form.Item
          field='marketable'
          label='上架'
          triggerPropName='checked'
          formatter={(value) => value === 1}
          getValueFromEvent={(value) => (value ? 1 : 2)}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          field='is_recommend'
          label='推荐'
          triggerPropName='checked'
          formatter={(value) => value === 1}
          getValueFromEvent={(value) => (value ? 1 : 2)}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          field='is_hot'
          label='热门'
          triggerPropName='checked'
          formatter={(value) => value === 1}
          getValueFromEvent={(value) => (value ? 1 : 2)}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          field='is_approve'
          label='仅员工可见'
          triggerPropName='checked'
          formatter={(value) => value === 1}
          getValueFromEvent={(value) => (value ? 1 : 2)}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          field='is_hidelinks'
          label='隐藏链接'
          triggerPropName='checked'
          formatter={(value) => value === 1}
          getValueFromEvent={(value) => (value ? 1 : 2)}
        >
          <Switch />
        </Form.Item>
        <SectionTitle>商品详情</SectionTitle>
        <Form.Item field='intro' label='商品详情'>
          <MyUpload />
        </Form.Item>
        <Form.Item label=' '>
          <div className='flex items-center space-x-4 mt-6'>
            <Button onClick={handleCancel}>取消</Button>
            <Button loading={isPending} htmlType='submit' type='primary'>
              确定
            </Button>
          </div>
        </Form.Item>
      </Form>
      {contextHolder}
    </BaseLayout>
  )
}
