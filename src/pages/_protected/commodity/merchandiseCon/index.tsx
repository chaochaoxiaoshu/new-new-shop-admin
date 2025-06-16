import { type } from 'arktype'
import { ChevronDown, Ellipsis, Plus, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'

import {
  Button,
  Dropdown,
  Input,
  Menu,
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
  GetGoodsRes,
  deleteGoods,
  getBrands,
  getDepartments,
  getGoods,
  getGoodsStatus,
  updateGoodsMarketable
} from '@/api'
import { MyImage } from '@/components/my-image'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { TableCellWidth, defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'goods'

const GoodsSearchSchema = type({
  'name?': 'string',
  'marketable?': '1 | 2',
  'department_id?': 'number',
  'brand_id?': 'number',
  'is_lnternal?': '1 | 2',
  'is_member_price?': '1 | 2',
  'is_approve?': '1 | 2',
  'is_hidelinks?': '1 | 2',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

const departmentsQueryOptions = queryOptions({
  queryKey: ['departments'],
  queryFn: () => getDepartments({ pageIndex: 1, pageSize: 9999 })
})

const brandsQueryOptions = queryOptions({
  queryKey: ['brands'],
  queryFn: () =>
    getBrands({
      department_id: useUserStore.getState().departmentId!
    })
})

const goodsPerCategoryCountsQueryOptions = queryOptions({
  queryKey: ['goods-per-category-counts'],
  queryFn: () =>
    getGoodsStatus({ department_id: useUserStore.getState().departmentId! })
})

function getGoodsQueryOptions(search: typeof GoodsSearchSchema.infer) {
  return queryOptions({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getGoods({
        ...search,
        with_fields: [
          'goods_type_name',
          'brand_name',
          'products',
          'images',
          'goods_departype_name'
        ]
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute('/_protected/commodity/merchandiseCon/')({
  head: () => getHead('商品管理'),
  validateSearch: GoodsSearchSchema,
  component: GoodsView,
  loader: () => {
    queryClient.prefetchQuery(departmentsQueryOptions)
    queryClient.prefetchQuery(brandsQueryOptions)
    queryClient.prefetchQuery(goodsPerCategoryCountsQueryOptions)
    return queryClient.ensureQueryData(
      getGoodsQueryOptions({
        page_index: 1,
        page_size: 10
      })
    )
  }
})

function GoodsView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const Link = Route.Link

  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermission = useUserStore(
    (store) => store.checkActionPermisstion
  )

  /* ------------------------------ Search START ------------------------------ */
  const [tempSearch, setTempSearch] = useState(search)

  const handleUpdateSearchParam = <
    K extends keyof typeof GoodsSearchSchema.infer
  >(
    key: K,
    value: (typeof GoodsSearchSchema.infer)[K]
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

  const { data: departments } = useQuery(departmentsQueryOptions)
  const { data: brandsData } = useQuery(brandsQueryOptions)
  const { data: goodsPerCategoryCounts } = useQuery(
    goodsPerCategoryCountsQueryOptions
  )

  /* ------------------------------- 批量操作 START ------------------------------- */
  const [batchListOrDelistCurrent, setBatchListOrDelistCurrent] = useState<
    1 | 2
  >(1)

  const batchListOrDelistCurrentButtonLabel =
    batchListOrDelistCurrent === 1 ? '上架' : '下架'

  const { mutateAsync: handleBatchListOrDelistCurrent } = useMutation({
    mutationKey: ['batch-list-or-delist-current'],
    mutationFn: (marketable: 1 | 2) => {
      setBatchListOrDelistCurrent(marketable)
      return Promise.all(
        selectedRowKeys.map((id) => updateGoodsMarketable({ id, marketable }))
      )
    },
    ...getNotifs({
      key: 'batch-list-or-delist-current',
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
        setSelectedRowKeys([])
      }
    })
  })
  /* -------------------------------- 批量操作 END -------------------------------- */

  const { data, isFetching } = useQuery(getGoodsQueryOptions(search))

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  const { mutateAsync: handleUpdateGoodsMarketable } = useMutation({
    mutationKey: ['update-goods-marketable'],
    mutationFn: updateGoodsMarketable,
    ...getNotifs({
      key: 'update-goods-marketable',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const handleAdd = () => {
    navigate({
      to: '/commodity/merchandiseCon/detail',
      search: { type: 'add' }
    })
  }

  const handleEdit = (goodsId: number) => {
    navigate({
      to: '/commodity/merchandiseCon/detail',
      search: { type: 'edit', goods_id: goodsId }
    })
  }

  const handleCopy = (goodsId: number) => {
    navigate({
      to: '/commodity/merchandiseCon/detail',
      search: { type: 'copy', goods_id: goodsId }
    })
  }

  const { mutateAsync: handleDeleteGoods } = useMutation({
    mutationKey: ['delete-goods'],
    mutationFn: deleteGoods,
    ...getNotifs({
      key: 'delete-goods',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const handleShare = (goodsId: number) => {
    // [TODO]: 分享商品
  }

  const handleViewComments = (goodsId: number) => {
    // [TODO]: 查看评论
  }

  const { columns, totalWidth } = defineTableColumns<GetGoodsRes>([
    {
      title: 'ID',
      dataIndex: 'goods_id',
      fixed: 'left',
      width: TableCellWidth.id,
      align: 'center'
    },
    {
      title: '上下架',
      render: (_, item) => (
        <Switch
          key={item.goods_id}
          checked={item.marketable === 1}
          checkedText='上架'
          uncheckedText='下架'
          onChange={(value) =>
            handleUpdateGoodsMarketable({
              id: item.goods_id!,
              marketable: value ? 1 : 2
            })
          }
        />
      ),
      width: 100,
      align: 'center'
    },
    {
      title: '缩略图',
      render: (_, item) => (
        <MyImage
          key={item.goods_id}
          src={item.image_url}
          width={40}
          height={40}
        />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true
    },
    {
      title: '品牌',
      dataIndex: 'brand_name',
      width: 120,
      align: 'center'
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '购买次数',
      dataIndex: 'buy_count',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '销售价',
      render: (_, item) => `¥ ${item.price ?? '-'}`,
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '成本价',
      render: (_, item) => `¥ ${item.costprice ?? '-'}`,
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '市场价',
      render: (_, item) => `¥ ${item.mktprice ?? '-'}`,
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '商品分类',
      dataIndex: 'goods_departype_name',
      width: 120,
      align: 'center'
    },
    {
      title: '类型',
      dataIndex: 'goods_type_name',
      width: 100,
      align: 'center',
      ellipsis: true,
      tooltip: true
    },
    {
      title: '是否支持内购',
      render: (_, item) => (item.is_lnternal === 1 ? '是' : '否'),
      width: 120,
      align: 'center'
    },
    {
      title: '内购价',
      render: (_, item) => `¥ ${item.internal_price ?? '-'}`,
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '是否支持会员价',
      render: (_, item) => (item.is_member_price === 1 ? '是' : '否'),
      width: 150,
      align: 'center'
    },
    {
      title: '是否同步万里牛',
      render: (_, item) => (item.is_sync === 1 ? '是' : '否'),
      width: 150,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='flex justify-center items-center'>
          {item.is_hidelinks === 1 && (
            <Button type='text' onClick={() => handleShare(item.goods_id!)}>
              推广
            </Button>
          )}
          <Dropdown
            trigger='click'
            droplist={
              <Menu>
                {checkActionPermission('/commodity/merchandiseCon/edit') && (
                  <Link
                    to='/commodity/merchandiseCon/detail'
                    search={{ type: 'edit', goods_id: item.goods_id! }}
                  >
                    <Menu.Item key='edit'>编辑</Menu.Item>
                  </Link>
                )}
                {checkActionPermission('/commodity/merchandiseCon/edit') && (
                  <Link
                    to='/commodity/merchandiseCon/detail'
                    search={{ type: 'copy', goods_id: item.goods_id! }}
                  >
                    <Menu.Item
                      key='copy'
                      onClick={() => handleCopy(item.goods_id!)}
                    >
                      复制
                    </Menu.Item>
                  </Link>
                )}
                {checkActionPermission('/commodity/merchandiseCon/del') && (
                  <Menu.Item
                    key='delete'
                    onClick={() => handleDeleteGoods({ id: item.goods_id! })}
                  >
                    删除
                  </Menu.Item>
                )}
                <Menu.Item
                  key='viewComments'
                  onClick={() => handleViewComments(item.goods_id!)}
                >
                  查看评价
                </Menu.Item>
              </Menu>
            }
          >
            <Button type='text' icon={<Ellipsis className='inline size-4' />} />
          </Dropdown>
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
        <div className='flex flex-col'>
          <TableLayout.Header>
            <Input
              value={tempSearch.name}
              placeholder='请输入商品名称'
              style={{ width: '264px' }}
              onChange={(value) => handleUpdateSearchParam('name', value)}
            />
            <Select
              value={tempSearch.marketable}
              placeholder='请选择上下架状态'
              allowClear
              style={{ width: '264px' }}
              onChange={(value) => handleUpdateSearchParam('marketable', value)}
            >
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={2}>下架</Select.Option>
            </Select>
            {departmentId === 0 && (
              <Select
                value={tempSearch.department_id}
                placeholder='请选择电商事业部'
                allowClear
                style={{ width: '264px' }}
                onChange={(value) =>
                  handleUpdateSearchParam('department_id', value)
                }
              >
                {departments?.items.map((item) => (
                  <Select.Option key={item.id} value={item.id!}>
                    {item.department_name}
                  </Select.Option>
                ))}
              </Select>
            )}
            <Select
              value={tempSearch.brand_id}
              placeholder='请选择商品品牌'
              allowClear
              style={{ width: '264px' }}
              onChange={(value) => handleUpdateSearchParam('brand_id', value)}
            >
              {brandsData?.items.map((item) => (
                <Select.Option key={item.brand_id} value={item.brand_id!}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={tempSearch.is_lnternal}
              placeholder='请选择是否支持内购'
              allowClear
              style={{ width: '264px' }}
              onChange={(value) =>
                handleUpdateSearchParam('is_lnternal', value)
              }
            >
              <Select.Option value={1}>是</Select.Option>
              <Select.Option value={2}>否</Select.Option>
            </Select>
            <Select
              value={tempSearch.is_member_price}
              placeholder='请选择是否支持会员价'
              allowClear
              style={{ width: '264px' }}
              onChange={(value) =>
                handleUpdateSearchParam('is_member_price', value)
              }
            >
              <Select.Option value={1}>是</Select.Option>
              <Select.Option value={2}>否</Select.Option>
            </Select>
            <Select
              value={tempSearch.is_approve}
              placeholder='请选择是否内购专区商品'
              allowClear
              style={{ width: '264px' }}
              onChange={(value) => handleUpdateSearchParam('is_approve', value)}
            >
              <Select.Option value={1}>是</Select.Option>
              <Select.Option value={2}>否</Select.Option>
            </Select>
            <Select
              value={tempSearch.is_hidelinks}
              placeholder='请选择是否隐藏链接'
              allowClear
              style={{ width: '264px' }}
              onChange={(value) =>
                handleUpdateSearchParam('is_hidelinks', value)
              }
            >
              <Select.Option value={1}>是</Select.Option>
              <Select.Option value={2}>否</Select.Option>
            </Select>
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
          <div className='flex items-center h-5 mt-6'>
            <div className='font-semibold mr-4'>商品列表</div>
            <div className='w-[1px] h-4 bg-[var(--color-border-2)]' />
            <Select
              value={search.marketable}
              bordered={false}
              style={{ width: 'fit-content', padding: '16px' }}
              trigger='click'
              triggerElement={
                <div className='flex items-center px-4 cursor-pointer mr-auto'>
                  <span className='text-muted-foreground'>
                    {
                      { '': '全部商品', 1: '上架商品', 2: '下架商品' }[
                        search.marketable ?? ''
                      ]
                    }
                  </span>
                  <span className='ml-1 text-accent'>
                    {goodsPerCategoryCounts
                      ? {
                          '': `(${goodsPerCategoryCounts?.total_goods})`,
                          1: `(${goodsPerCategoryCounts?.total_marketable})`,
                          2: `(${goodsPerCategoryCounts?.total_unmarketable})`
                        }[search.marketable ?? '']
                      : ''}
                  </span>
                  <ChevronDown className='inline ml-2 size-4' />
                </div>
              }
              onChange={(val) => {
                setTempSearch((prev) => {
                  const next = {
                    ...prev,
                    marketable: val !== '' ? val : undefined
                  }
                  navigate({ search: next })
                  return next
                })
              }}
            >
              <Select.Option value={''}>
                <span>全部商品</span>
                <span className='ml-1 text-accent'>
                  {goodsPerCategoryCounts
                    ? `(${goodsPerCategoryCounts?.total_goods})`
                    : ''}
                </span>
              </Select.Option>
              <Select.Option value={1}>
                <span>上架商品</span>
                <span className='ml-1 text-accent'>
                  {goodsPerCategoryCounts
                    ? `(${goodsPerCategoryCounts?.total_marketable})`
                    : ''}
                </span>
              </Select.Option>
              <Select.Option value={2}>
                <span>下架商品</span>
                <span className='ml-1 text-accent'>
                  {goodsPerCategoryCounts
                    ? `(${goodsPerCategoryCounts?.total_unmarketable})`
                    : ''}
                </span>
              </Select.Option>
            </Select>
            <div className='flex items-center space-x-3'>
              <Button disabled={!selectedRowKeys.length} type='secondary'>
                删除
              </Button>
              <Button.Group>
                <Button disabled={!selectedRowKeys.length} type='secondary'>
                  {batchListOrDelistCurrentButtonLabel}
                </Button>
                <Dropdown
                  disabled={!selectedRowKeys.length}
                  trigger='click'
                  position='br'
                  droplist={
                    <Menu>
                      <Menu.Item
                        key='1'
                        onClick={() => handleBatchListOrDelistCurrent(1)}
                      >
                        上架
                      </Menu.Item>
                      <Menu.Item
                        key='2'
                        onClick={() => handleBatchListOrDelistCurrent(2)}
                      >
                        下架
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button
                    type='secondary'
                    icon={<ChevronDown className='inline size-4' />}
                  />
                </Dropdown>
              </Button.Group>
              {departmentId !== 0 && (
                <Button
                  type='primary'
                  onClick={handleAdd}
                  icon={<Plus className='inline size-4' />}
                >
                  新增
                </Button>
              )}
            </div>
          </div>
        </div>
      }
    >
      <MyTable
        rowKey='goods_id'
        data={data?.items}
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 300 }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (selectedRowKeys) =>
            setSelectedRowKeys(selectedRowKeys as number[])
        }}
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
