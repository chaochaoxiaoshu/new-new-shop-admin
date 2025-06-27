import { Button, Input, Select, Table } from '@arco-design/web-react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { FileText, RotateCcw, Search, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  AfterSalesStatus,
  GetAfterSalesRes,
  GetOrdersRes,
  GoodsType,
  getAfterSales,
  getOrders
} from '@/api'
import { GoodsInfo } from '@/components/goods-info'
import { MyDatePicker } from '@/components/my-date-picker'
import {
  getAfterSalesStatusText,
  getAfterSalesTypeText,
  getPayStatusText,
  getShipStatusText
} from '@/helpers'
import { defineTableColumns, formatDateTime, TableCellWidth } from '@/lib'
import { useUserStore } from '@/stores'

export function TransactionDetail() {
  const [tabSelection, setTabSelection] = useState<'orders' | 'afterSales'>(
    'orders'
  )

  return (
    <div>
      <div className='flex items-center mt-4 space-x-4'>
        <Button
          type='text'
          style={{
            padding: 0,
            fontWeight: 500,
            color:
              tabSelection === 'orders'
                ? 'var(--accent)'
                : 'var(--color-text-1)'
          }}
          onClick={() => setTabSelection('orders')}
        >
          订单
        </Button>
        <Button
          type='text'
          style={{
            padding: 0,
            fontWeight: 500,
            color:
              tabSelection === 'afterSales'
                ? 'var(--accent)'
                : 'var(--color-text-1)'
          }}
          onClick={() => setTabSelection('afterSales')}
        >
          售后单
        </Button>
      </div>
      <div className='mt-6'>
        {tabSelection === 'orders' ? <Orders /> : <AfterSales />}
      </div>
    </div>
  )
}

function Orders() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    order_ids?: string
    range?: [number, number]
    ship_mobile?: string
    goods_name?: string
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const { control, handleSubmit, reset } = useForm({
    defaultValues: searchParams
  })

  const { data, isPending } = useQuery({
    queryKey: ['user-orders', searchParams, search.id],
    queryFn: () =>
      getOrders({
        ...searchParams,
        user_id: search.id,
        start_time: searchParams.range?.[0],
        end_time: searchParams.range?.[1],
        with_fields: ['order_items', 'users'],
        department_id: useUserStore.getState().departmentId!
      })
  })

  const { columns, totalWidth } = defineTableColumns<GetOrdersRes>([
    {
      title: '订单号',
      fixed: 'left',
      dataIndex: 'order_id',
      align: 'center',
      width: 230,
      ellipsis: true
    },
    {
      title: '商品信息',
      render: (_, item) => (
        <div className='my-2'>
          {item.order_items?.map((item) => (
            <GoodsInfo
              key={item.goods_id}
              imageUrl={item.image_url}
              name={item.name}
              price={item.price}
              quantity={item.nums}
            />
          ))}
        </div>
      ),
      align: 'center'
    },
    {
      title: '下单时间',
      render: (_, item) => formatDateTime(item.ctime),
      align: 'center',
      width: TableCellWidth.datetime,
      ellipsis: true
    },
    {
      title: '订单总额',
      render: (_, item) => (item.order_amount ? `¥ ${item.order_amount}` : '-'),
      align: 'center',
      width: TableCellWidth.amountS,
      ellipsis: true
    },
    {
      title: '配送方式',
      render: (_, item) =>
        item.delivery === 1
          ? '快递邮寄'
          : item.delivery === 2
          ? '门店自提'
          : '-',
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '订单状态',
      dataIndex: 'status_order_text',
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '售后状态',
      dataIndex: 'after_sale_status',
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '买家/收货人',
      render: (_, item) => (
        <>
          <div className='mb-[10px]'>买家：{item.ship_name}</div>
          <div>收货人：{item.ship_name}</div>
        </>
      ),
      align: 'center',
      width: 180,
      ellipsis: true
    },
    {
      title: '支付状态',
      render: (_, item) => getPayStatusText(item.pay_status),
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '发货状态',
      render: (_, item) => getShipStatusText(item.ship_status),
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '是否同步',
      render: (_, item) =>
        item.is_sync === 1 ? '已同步' : item.is_sync === 0 ? '未同步' : '-',
      align: 'center',
      width: 120,
      ellipsis: true
    }
  ])

  return (
    <>
      <form
        className='flex-none flex flex-wrap gap-4 items-center'
        onSubmit={handleSubmit((values) => setSearchParams(values))}
        onReset={() => {
          reset()
          setSearchParams({
            page_index: searchParams.page_index,
            page_size: searchParams.page_size
          })
        }}
      >
        <Controller
          control={control}
          name='order_ids'
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
          name='range'
          render={({ field }) => (
            <MyDatePicker.RangePicker {...field} style={{ width: '264px' }} />
          )}
        />
        <Controller
          control={control}
          name='ship_mobile'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='请输入收货人手机号'
              style={{ width: '264px' }}
              suffix={<Smartphone className='inline size-4' />}
            />
          )}
        />
        <Controller
          control={control}
          name='goods_name'
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
      <div className='mt-6'>
        <Table
          rowKey='order_id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          scroll={{ x: totalWidth + 440 }}
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

function AfterSales() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    order_id?: string
    after_sales_id?: string
    status?: AfterSalesStatus
    type?: GoodsType
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const { control, handleSubmit, reset } = useForm({
    defaultValues: searchParams
  })

  const { data, isPending } = useQuery({
    queryKey: ['user-after-sales', searchParams, search.id],
    queryFn: () =>
      getAfterSales({
        ...searchParams,
        user_id: search.id,
        department_id: useUserStore.getState().departmentId!,
        with_fields: ['users']
      })
  })

  const { columns, totalWidth } = defineTableColumns<GetAfterSalesRes>([
    {
      title: '售后单号',
      dataIndex: 'after_sales_id',
      width: 230,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
      align: 'center'
    },
    {
      title: '状态',
      render: (_, item) => getAfterSalesStatusText(item.status),
      width: 120,
      align: 'center'
    },
    {
      title: '商品状态',
      render: (_, item) => getAfterSalesTypeText(item.type),
      width: 120,
      align: 'center'
    },
    {
      title: '用户',
      render: (_, item) => item.user_info?.nickname || '-',
      width: 200,
      align: 'center'
    },
    {
      title: '退款金额',
      dataIndex: 'refund',
      width: TableCellWidth.amountS,
      align: 'center'
    },
    {
      title: '用户反馈',
      dataIndex: 'reason',
      width: 220,
      align: 'center'
    },
    {
      title: '系统原因',
      dataIndex: 'mark',
      width: 220,
      align: 'center'
    },
    {
      title: '申请时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    }
  ])

  return (
    <>
      <form
        className='flex-none flex flex-wrap gap-4 items-center'
        onSubmit={handleSubmit((values) => setSearchParams(values))}
        onReset={() => {
          reset()
          setSearchParams({
            page_index: searchParams.page_index,
            page_size: searchParams.page_size
          })
        }}
      >
        <Controller
          control={control}
          name='after_sales_id'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='请输入售后单号'
              style={{ width: '264px' }}
              suffix={<FileText className='inline size-4' />}
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
          name='status'
          render={({ field }) => (
            <Select
              {...field}
              placeholder='请选择状态'
              style={{ width: '264px' }}
            >
              <Select.Option value={1}>未审核</Select.Option>
              <Select.Option value={2}>审核通过</Select.Option>
              <Select.Option value={3}>审核拒绝</Select.Option>
            </Select>
          )}
        />
        <Controller
          control={control}
          name='type'
          render={({ field }) => (
            <Select
              {...field}
              placeholder='请选择商品状态'
              style={{ width: '264px' }}
            >
              <Select.Option value={1}>未发货</Select.Option>
              <Select.Option value={2}>已发货</Select.Option>
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
      <div className='mt-6'>
        <Table
          rowKey='after_sales_id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          scroll={{ x: totalWidth + 220 }}
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
