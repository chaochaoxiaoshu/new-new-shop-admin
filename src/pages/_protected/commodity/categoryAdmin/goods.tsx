import { Button, Input } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { GetGoodsRes, getGoods } from '@/api'
import { MyImage } from '@/components/my-image'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead } from '@/helpers'
import {
  defineTableColumns,
  formatAmount,
  queryClient,
  TableCellWidth
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'admin-categories-goods'

export const Route = createFileRoute(
  '/_protected/commodity/categoryAdmin/goods'
)({
  validateSearch: type({
    goods_cat_id: 'number',
    'name?': 'string',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ search }) => ({
    adminCategoriesGoodsQueryOptions: queryOptions({
      queryKey: [LIST_KEY, search],
      queryFn: () =>
        getGoods({
          ...search,
          department_id: useUserStore.getState().departmentId!,
          marketable: 1
        }),
      placeholderData: keepPreviousData
    })
  }),
  loader: async ({ context }) => {
    await queryClient.prefetchQuery(context.adminCategoriesGoodsQueryOptions)
  },
  component: AdminCategoriesGoodsView,
  head: () => getHead('总部分类/商品')
})

function AdminCategoriesGoodsView() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const { data, isFetching } = useQuery(
    context.adminCategoriesGoodsQueryOptions
  )

  const { columns } = defineTableColumns<GetGoodsRes>([
    {
      title: 'ID',
      dataIndex: 'goods_id',
      fixed: 'left',
      width: TableCellWidth.id,
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
      title: '销售价',
      render: (_, item) => formatAmount(item.price),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '成本价',
      render: (_, item) => formatAmount(item.costprice),
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '市场价',
      render: (_, item) => formatAmount(item.mktprice),
      width: TableCellWidth.amountS,
      align: 'center'
    }
  ])

  return (
    <TableLayout
      header={
        <form
          onSubmit={handleSubmit((values) => navigate({ search: values }))}
          onReset={() => {
            reset()
            navigate({
              search: {
                goods_cat_id: search.goods_cat_id,
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
                placeholder='请输入商品名称'
                style={{ width: '264px' }}
                suffix={<Search className='inline size-4' />}
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
        rowKey='goods_id'
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
