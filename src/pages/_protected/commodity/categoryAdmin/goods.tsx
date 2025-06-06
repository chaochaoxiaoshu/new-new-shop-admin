import { type } from 'arktype'
import { RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button, Image, Input } from '@arco-design/web-react'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { GetGoodsRes, getGoods } from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { TableCellWidth, defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'admin-categories-goods'

const AdminCategoriesGoodsSearchSchema = type({
  goods_cat_id: 'number',
  'name?': 'string',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

function getAdminCategoriesGoodsQueryOptions(
  search: typeof AdminCategoriesGoodsSearchSchema.infer
) {
  return queryOptions({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getGoods({
        ...search,
        department_id: useUserStore.getState().departmentId!,
        marketable: 1
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute(
  '/_protected/commodity/categoryAdmin/goods'
)({
  validateSearch: AdminCategoriesGoodsSearchSchema,
  component: AdminCategoriesGoodsView,
  loaderDeps: ({ search }) => ({
    goods_cat_id: search.goods_cat_id
  }),
  loader: ({ deps }) =>
    queryClient.ensureQueryData(
      getAdminCategoriesGoodsQueryOptions({
        goods_cat_id: deps.goods_cat_id,
        page_index: 1,
        page_size: 10
      })
    )
})

function AdminCategoriesGoodsView() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const [tempSearch, setTempSearch] = useState(search)

  const handleSearch = () => {
    navigate({ search: tempSearch })
  }

  const handleReset = () => {
    const initial = {
      goods_cat_id: search.goods_cat_id,
      page_index: search.page_index,
      page_size: search.page_size
    }
    navigate({ search: initial })
    setTempSearch(initial)
  }

  const { data, isFetching } = useQuery(
    getAdminCategoriesGoodsQueryOptions(search)
  )

  const { columns } = useMemo(() => {
    return defineTableColumns<GetGoodsRes>([
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
          <Image
            key={item.goods_id}
            src={item.image_url}
            alt={item.name}
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
      }
    ])
  }, [])

  return (
    <TableLayout
      header={
        <TableLayout.Header>
          <Input
            value={tempSearch.name}
            placeholder='请输入商品名称'
            style={{ width: '264px' }}
            onChange={(value) =>
              setTempSearch((prev) => ({ ...prev, name: value }))
            }
          />
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
