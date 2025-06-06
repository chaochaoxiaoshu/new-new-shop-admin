import { type } from 'arktype'
import { Plus, RotateCcw, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { Button, Input, Popconfirm, Switch } from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  GetGoodsSecondaryCategoriesRes,
  deleteGoodsCategory,
  getGoodsSecondaryCategories,
  updateGoodsCategory
} from '@/api'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import { TableCellWidth, defineTableColumns, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

import { EditForm } from '.'

const LIST_KEY = 'goods-secondary-categories'

const GoodsSecondaryCategoriesSearchSchema = type({
  id: 'number',
  'name?': 'string',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

function getGoodsSecondaryCategoriesQueryOptions(
  search: typeof GoodsSecondaryCategoriesSearchSchema.infer
) {
  return queryOptions({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getGoodsSecondaryCategories({
        ...search,
        department: useUserStore.getState().departmentId!
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute('/_protected/commodity/category/info')({
  head: () => getHead('商品二级/分类'),
  validateSearch: GoodsSecondaryCategoriesSearchSchema,
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ id: search.id }),
  loader: ({ deps }) =>
    queryClient.ensureQueryData(
      getGoodsSecondaryCategoriesQueryOptions({
        id: deps.id,
        page_index: 1,
        page_size: 10
      })
    )
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [openModal, contextHolder] = useMyModal()
  const departmentId = useUserStore((store) => store.departmentId)
  const checkActionPermisstion = useUserStore(
    (store) => store.checkActionPermisstion
  )

  /* ------------------------------ Search START ------------------------------ */
  const [tempSearch, setTempSearch] = useState(search)

  const handleUpdateSearchParam = <
    K extends keyof typeof GoodsSecondaryCategoriesSearchSchema.infer
  >(
    key: K,
    value: (typeof GoodsSecondaryCategoriesSearchSchema.infer)[K]
  ) => {
    setTempSearch((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    navigate({ search: tempSearch })
  }

  const handleReset = () => {
    const initial = {
      id: search.id,
      page_index: search.page_index,
      page_size: search.page_size
    }
    navigate({ search: initial })
    setTempSearch(initial)
  }
  /* ------------------------------- Search END ------------------------------- */

  const { data, isFetching } = useQuery(
    getGoodsSecondaryCategoriesQueryOptions(search)
  )

  const handleAdd = useCallback(() => {
    const modalIns = openModal({
      title: '新增商品二级分类',
      content: (
        <EditForm
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 600 }
    })
  }, [openModal])

  const handleEdit = useCallback(
    (item: GetGoodsSecondaryCategoriesRes) => {
      const modalIns = openModal({
        title: '编辑商品二级分类',
        content: (
          <EditForm
            initialData={item}
            onSuccess={async () => {
              await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
              modalIns?.close()
            }}
            onCancel={() => modalIns?.close()}
          />
        ),
        style: { width: 600 }
      })
    },
    [openModal]
  )

  const { mutate: handleToggleVisibility } = useMutation({
    mutationKey: ['update-goods-secondary-category'],
    mutationFn: (item: GetGoodsSecondaryCategoriesRes) =>
      updateGoodsCategory({
        ...item,
        status: item.status === 1 ? 2 : 1
      }),
    ...getNotifs({
      key: 'update-goods-secondary-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { mutate: handleDelete } = useMutation({
    mutationKey: ['delete-goods-secondary-category'],
    mutationFn: async (item: GetGoodsSecondaryCategoriesRes) => {
      await deleteGoodsCategory({ id: item.id! })
    },
    ...getNotifs({
      key: 'delete-goods-secondary-category',
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
    })
  })

  const { columns } = useMemo(
    () =>
      defineTableColumns<GetGoodsSecondaryCategoriesRes>([
        {
          title: 'ID',
          dataIndex: 'id',
          fixed: 'left',
          width: TableCellWidth.id,
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
              {checkActionPermisstion('/commodity/category/edit/second') && (
                <Button type='text' onClick={() => handleEdit(item)}>
                  编辑
                </Button>
              )}
              {checkActionPermisstion('/commodity/category/del/second') && (
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
      ]),
    [checkActionPermisstion, handleDelete, handleEdit, handleToggleVisibility]
  )

  return (
    <TableLayout
      header={
        <TableLayout.Header>
          <Input
            value={tempSearch.name}
            placeholder='请输入分类名称'
            style={{ width: '264px' }}
            onChange={(value) => handleUpdateSearchParam('name', value)}
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
          {departmentId !== 0 &&
            checkActionPermisstion('/commodity/category/add/second') && (
              <Button
                type='primary'
                icon={<Plus className='inline size-4' />}
                onClick={handleAdd}
              >
                新增
              </Button>
            )}
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
      {contextHolder}
    </TableLayout>
  )
}
