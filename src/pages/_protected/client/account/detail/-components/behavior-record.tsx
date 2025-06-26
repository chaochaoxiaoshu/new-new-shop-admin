import { Button, Input, Select, Table } from '@arco-design/web-react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import {
  GetUserBrowsingRes,
  GetUserCartRes,
  GetUserFavoritesRes,
  getUserBrowsing,
  getUserCart,
  getUserFavorites,
  getUserSharingRecords
} from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
import { MyImage } from '@/components/my-image'
import { paginationFields, useTempSearch } from '@/hooks'
import { defineTableColumns, formatDateTime, TableCellWidth } from '@/lib'

export function BehaviorRecord() {
  const [tabSelection, setTabSelection] = useState<
    'browsing' | 'addToCart' | 'favorites' | 'sharing'
  >('browsing')

  const Components: Record<
    'browsing' | 'addToCart' | 'favorites' | 'sharing',
    React.ReactNode
  > = {
    browsing: <Browsing />,
    addToCart: <AddToCart />,
    favorites: <Favorites />,
    sharing: <Sharing />
  }

  return (
    <div>
      <div className='flex items-center mt-4 space-x-4'>
        <Button
          type='text'
          style={{
            padding: 0,
            fontWeight: 500,
            color:
              tabSelection === 'browsing'
                ? 'var(--accent)'
                : 'var(--color-text-1)'
          }}
          onClick={() => setTabSelection('browsing')}
        >
          浏览记录
        </Button>
        <Button
          type='text'
          style={{
            padding: 0,
            fontWeight: 500,
            color:
              tabSelection === 'addToCart'
                ? 'var(--accent)'
                : 'var(--color-text-1)'
          }}
          onClick={() => setTabSelection('addToCart')}
        >
          加购记录
        </Button>
        <Button
          type='text'
          style={{
            padding: 0,
            fontWeight: 500,
            color:
              tabSelection === 'favorites'
                ? 'var(--accent)'
                : 'var(--color-text-1)'
          }}
          onClick={() => setTabSelection('favorites')}
        >
          收藏记录
        </Button>
        <Button
          type='text'
          style={{
            padding: 0,
            fontWeight: 500,
            color:
              tabSelection === 'sharing'
                ? 'var(--accent)'
                : 'var(--color-text-1)'
          }}
          onClick={() => setTabSelection('sharing')}
        >
          分享记录
        </Button>
      </div>
      <div className='mt-6'>{Components[tabSelection]}</div>
    </div>
  )
}

function Browsing() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    goods_name?: string
    start_time?: number
    end_time?: number
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const { tempSearch, setTempSearch, updateSearchField, commit, reset } =
    useTempSearch({
      search: searchParams,
      updateFn: setSearchParams,
      selectDefaultFields: paginationFields
    })

  const { data, isPending } = useQuery({
    queryKey: ['user-browsing', searchParams, search.id],
    queryFn: () =>
      getUserBrowsing({
        ...searchParams,
        user_id: search.id
      })
  })

  const { columns } = defineTableColumns<GetUserBrowsingRes>([
    {
      title: '时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '商品图片',
      render: (_, item) => (
        <MyImage src={item.goods_url} width={40} height={40} />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '浏览商品',
      dataIndex: 'goods_name',
      align: 'center'
    },
    {
      title: '时长',
      dataIndex: 'duration',
      width: 200,
      align: 'center'
    }
  ])

  return (
    <>
      <div className='flex-none flex flex-wrap gap-4 items-center'>
        <Input
          value={tempSearch.goods_name}
          placeholder='请输入商品名称'
          style={{ width: '264px' }}
          suffix={<Search className='inline size-4' />}
          onChange={(val) => updateSearchField('goods_name', val)}
        />
        <MyDatePicker.RangePicker
          value={[tempSearch.start_time, tempSearch.end_time]}
          style={{ width: '264px' }}
          onChange={(val) => {
            setTempSearch((prev) => ({
              ...prev,
              start_time: val?.[0],
              end_time: val?.[1]
            }))
          }}
        />
        <Button
          type='primary'
          icon={<Search className='inline size-4' />}
          onClick={commit}
        >
          查询
        </Button>
        <Button
          type='outline'
          icon={<RotateCcw className='inline size-4' />}
          onClick={reset}
        >
          重置
        </Button>
      </div>
      <div className='mt-6'>
        <Table
          rowKey='id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          pagination={{
            current: data?.paginate.page_index,
            pageSize: data?.paginate.page_size,
            total: data?.paginate.total,
            onChange: (current, pageSize) => {
              setSearchParams((prev) => ({
                ...prev,
                page_index: current,
                page_size: pageSize
              }))
            }
          }}
          renderPagination={(paginationNode) => (
            <div className='flex justify-between items-center mt-4'>
              <span>共 {data?.paginate.total} 条</span>
              {paginationNode}
            </div>
          )}
        />
      </div>
    </>
  )
}

function AddToCart() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    formtype?: number
    start_time?: number
    end_time?: number
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const { tempSearch, setTempSearch, updateSearchField, commit, reset } =
    useTempSearch({
      search: searchParams,
      updateFn: setSearchParams,
      selectDefaultFields: paginationFields
    })

  const { data, isPending } = useQuery({
    queryKey: ['user-cart', searchParams, search.id],
    queryFn: () =>
      getUserCart({
        ...searchParams,
        user_id: search.id
      })
  })

  const { columns } = defineTableColumns<GetUserCartRes>([
    {
      title: '时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '商品图片',
      render: (_, item) => (
        <MyImage src={item.goods_url} width={40} height={40} />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '商品名称',
      dataIndex: 'goods_name',
      align: 'center'
    },
    {
      title: '规格',
      dataIndex: 'product_name',
      width: 120,
      ellipsis: true,
      align: 'center'
    },
    {
      title: '数量',
      dataIndex: 'nums',
      width: 120,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (item.formtype === 2 ? '移除购物车' : '加入购物车'),
      width: 120,
      align: 'center'
    }
  ])

  return (
    <>
      <div className='flex-none flex flex-wrap gap-4 items-center'>
        <Select
          value={tempSearch.formtype}
          placeholder='请选择状态'
          style={{ width: '264px' }}
          onChange={(val) => updateSearchField('formtype', val as number)}
        >
          <Select.Option value={1}>加入购物车</Select.Option>
          <Select.Option value={2}>移除购物车</Select.Option>
        </Select>
        <MyDatePicker.RangePicker
          value={[tempSearch.start_time, tempSearch.end_time]}
          style={{ width: '264px' }}
          onChange={(val) => {
            setTempSearch((prev) => ({
              ...prev,
              start_time: val?.[0],
              end_time: val?.[1]
            }))
          }}
        />
        <Button
          type='primary'
          icon={<Search className='inline size-4' />}
          onClick={commit}
        >
          查询
        </Button>
        <Button
          type='outline'
          icon={<RotateCcw className='inline size-4' />}
          onClick={reset}
        >
          重置
        </Button>
      </div>
      <div className='mt-6'>
        <Table
          rowKey='id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          pagination={{
            current: data?.paginate.page_index,
            pageSize: data?.paginate.page_size,
            total: data?.paginate.total,
            onChange: (current, pageSize) => {
              setSearchParams((prev) => ({
                ...prev,
                page_index: current,
                page_size: pageSize
              }))
            }
          }}
          renderPagination={(paginationNode) => (
            <div className='flex justify-between items-center mt-4'>
              <span>共 {data?.paginate.total} 条</span>
              {paginationNode}
            </div>
          )}
        />
      </div>
    </>
  )
}

function Favorites() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    goods_name?: string
    type?: number
    start_time?: number
    end_time?: number
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const { tempSearch, setTempSearch, updateSearchField, commit, reset } =
    useTempSearch({
      search: searchParams,
      updateFn: setSearchParams,
      selectDefaultFields: paginationFields
    })

  const { data, isPending } = useQuery({
    queryKey: ['user-favorites', searchParams, search.id],
    queryFn: () =>
      getUserFavorites({
        ...searchParams,
        user_id: search.id
      })
  })

  const { columns } = defineTableColumns<GetUserFavoritesRes>([
    {
      title: '时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '商品图片',
      render: (_, item) => (
        <MyImage src={item.goods_url} width={40} height={40} />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '商品名称',
      dataIndex: 'goods_name',
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (item.type === 1 ? '加入收藏' : '移除收藏'),
      width: 120,
      align: 'center'
    }
  ])

  return (
    <>
      <div className='flex-none flex flex-wrap gap-4 items-center'>
        <Input
          value={tempSearch.goods_name}
          placeholder='请输入商品名称'
          style={{ width: '264px' }}
          suffix={<Search className='inline size-4' />}
          onChange={(val) => updateSearchField('goods_name', val)}
        />
        <Select
          value={tempSearch.type}
          placeholder='请选择状态'
          style={{ width: '264px' }}
          onChange={(val) => updateSearchField('type', val as number)}
        >
          <Select.Option value={1}>加入</Select.Option>
          <Select.Option value={2}>移除</Select.Option>
        </Select>
        <MyDatePicker.RangePicker
          value={[tempSearch.start_time, tempSearch.end_time]}
          style={{ width: '264px' }}
          onChange={(val) => {
            setTempSearch((prev) => ({
              ...prev,
              start_time: val?.[0],
              end_time: val?.[1]
            }))
          }}
        />
        <Button
          type='primary'
          icon={<Search className='inline size-4' />}
          onClick={commit}
        >
          查询
        </Button>
        <Button
          type='outline'
          icon={<RotateCcw className='inline size-4' />}
          onClick={reset}
        >
          重置
        </Button>
      </div>
      <div className='mt-6'>
        <Table
          rowKey='id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          pagination={{
            current: data?.paginate.page_index,
            pageSize: data?.paginate.page_size,
            total: data?.paginate.total,
            onChange: (current, pageSize) => {
              setSearchParams((prev) => ({
                ...prev,
                page_index: current,
                page_size: pageSize
              }))
            }
          }}
          renderPagination={(paginationNode) => (
            <div className='flex justify-between items-center mt-4'>
              <span>共 {data?.paginate.total} 条</span>
              {paginationNode}
            </div>
          )}
        />
      </div>
    </>
  )
}

function Sharing() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    goods_name?: string
    start_time?: number
    end_time?: number
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const { tempSearch, setTempSearch, updateSearchField, commit, reset } =
    useTempSearch({
      search: searchParams,
      updateFn: setSearchParams,
      selectDefaultFields: paginationFields
    })

  const { data, isPending } = useQuery({
    queryKey: ['user-sharing', searchParams, search.id],
    queryFn: () =>
      getUserSharingRecords({
        ...searchParams,
        user_id: search.id
      })
  })

  const { columns } = defineTableColumns<GetUserFavoritesRes>([
    {
      title: '时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '商品图片',
      render: (_, item) => (
        <MyImage src={item.goods_url} width={40} height={40} />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '分享商品',
      render: (_, item) => item.goods_name,
      align: 'center'
    }
  ])

  return (
    <>
      <div className='flex-none flex flex-wrap gap-4 items-center'>
        <Input
          value={tempSearch.goods_name}
          placeholder='请输入商品名称'
          style={{ width: '264px' }}
          suffix={<Search className='inline size-4' />}
          onChange={(val) => updateSearchField('goods_name', val)}
        />
        <MyDatePicker.RangePicker
          value={[tempSearch.start_time, tempSearch.end_time]}
          style={{ width: '264px' }}
          onChange={(val) => {
            setTempSearch((prev) => ({
              ...prev,
              start_time: val?.[0],
              end_time: val?.[1]
            }))
          }}
        />
        <Button
          type='primary'
          icon={<Search className='inline size-4' />}
          onClick={commit}
        >
          查询
        </Button>
        <Button
          type='outline'
          icon={<RotateCcw className='inline size-4' />}
          onClick={reset}
        >
          重置
        </Button>
      </div>
      <div className='mt-6'>
        <Table
          rowKey='id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          pagination={{
            current: data?.paginate.page_index,
            pageSize: data?.paginate.page_size,
            total: data?.paginate.total,
            onChange: (current, pageSize) => {
              setSearchParams((prev) => ({
                ...prev,
                page_index: current,
                page_size: pageSize
              }))
            }
          }}
          renderPagination={(paginationNode) => (
            <div className='flex justify-between items-center mt-4'>
              <span>共 {data?.paginate.total} 条</span>
              {paginationNode}
            </div>
          )}
        />
      </div>
    </>
  )
}
