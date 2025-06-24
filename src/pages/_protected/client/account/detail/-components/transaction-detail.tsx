import dayjs from 'dayjs'
import { FileText, RotateCcw, Search, Smartphone } from 'lucide-react'
import { useState } from 'react'

import {
  Button,
  DatePicker,
  Input,
  Select,
  Table
} from '@arco-design/web-react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

import { GetOrdersRes, getOrders } from '@/api'
import {
  AfterSalesStatus,
  GetAfterSalesRes,
  GoodsType,
  getAfterSales
} from '@/api/orders/get-after-sales'
import { GoodsInfo } from '@/components/goods-info'
import {
  getAfterSalesStatusText,
  getAfterSalesTypeText,
  getPayStatusText,
  getShipStatusText
} from '@/helpers'
import { TableCellWidth, defineTableColumns, formatDateTime } from '@/lib'
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
    start_time?: number
    end_time?: number
    ship_mobile?: string
    goods_name?: string
    page_index: number
    page_size: number
  }
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page_index: 1,
    page_size: 20
  })
  const [tempSearchParams, setTempSearchParams] = useState<
    Omit<SearchParams, 'page_index' | 'page_size'>
  >({})

  const handleUpdateSearchParam = (key: keyof SearchParams, value: unknown) => {
    setTempSearchParams((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      ...tempSearchParams
    }))
  }

  const handleReset = () => {
    setTempSearchParams({})
    setSearchParams((prev) => ({
      page_index: prev.page_index,
      page_size: prev.page_size
    }))
  }

  const { data, isPending } = useQuery({
    queryKey: ['user-orders', searchParams, search.id],
    queryFn: () =>
      getOrders({
        ...searchParams,
        user_id: search.id,
        start_time: searchParams.start_time,
        end_time: searchParams.end_time,
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
      <div className='flex-none flex flex-wrap gap-4 items-center'>
        <Input
          value={tempSearchParams.order_ids}
          placeholder='请输入订单号'
          style={{ width: '264px' }}
          allowClear
          suffix={<FileText className='inline size-4' />}
          onChange={(val) => handleUpdateSearchParam('order_ids', val)}
        />
        <DatePicker.RangePicker
          value={
            tempSearchParams.start_time && tempSearchParams.end_time
              ? [
                  dayjs.unix(tempSearchParams.start_time),
                  dayjs.unix(tempSearchParams.end_time)
                ]
              : undefined
          }
          style={{ width: '264px' }}
          onChange={(val) => {
            if (!(val as string[] | undefined)) {
              setTempSearchParams((prev) => ({
                ...prev,
                start_time: undefined,
                end_time: undefined
              }))
            } else {
              setTempSearchParams((prev) => ({
                ...prev,
                start_time: dayjs(val[0]).unix(),
                end_time: dayjs(val[1]).unix()
              }))
            }
          }}
        />
        <Input
          value={tempSearchParams.ship_mobile}
          placeholder='请输入收货人手机号'
          style={{ width: '264px' }}
          allowClear
          suffix={<Smartphone className='inline size-4' />}
          onChange={(val) => handleUpdateSearchParam('ship_mobile', val)}
        />
        <Input
          value={tempSearchParams.goods_name}
          placeholder='请输入商品名称'
          style={{ width: '264px' }}
          allowClear
          suffix={<Search className='inline size-4' />}
          onChange={(val) => handleUpdateSearchParam('goods_name', val)}
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
      </div>
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
  const [tempSearchParams, setTempSearchParams] = useState<
    Omit<SearchParams, 'page_index' | 'page_size'>
  >({})

  const handleUpdateSearchParam = (key: keyof SearchParams, value: unknown) => {
    setTempSearchParams((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      ...tempSearchParams
    }))
  }

  const handleReset = () => {
    setTempSearchParams({})
    setSearchParams((prev) => ({
      page_index: prev.page_index,
      page_size: prev.page_size
    }))
  }

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
      render: (_, item) => item.user_info?.nickname.trim() ?? '-',
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
      <div className='flex-none flex flex-wrap gap-4 items-center'>
        <Input
          value={tempSearchParams.after_sales_id}
          placeholder='请输入售后单号'
          style={{ width: '264px' }}
          allowClear
          suffix={<FileText className='inline size-4' />}
          onChange={(val) => handleUpdateSearchParam('after_sales_id', val)}
        />
        <Input
          value={tempSearchParams.order_id}
          placeholder='请输入订单号'
          style={{ width: '264px' }}
          allowClear
          suffix={<FileText className='inline size-4' />}
          onChange={(val) => handleUpdateSearchParam('order_id', val)}
        />
        <Select
          value={tempSearchParams.status}
          placeholder='请选择状态'
          style={{ width: '264px' }}
          allowClear
          onChange={(val) => handleUpdateSearchParam('status', val)}
        >
          <Select.Option value={1}>未审核</Select.Option>
          <Select.Option value={2}>审核通过</Select.Option>
          <Select.Option value={3}>审核拒绝</Select.Option>
        </Select>
        <Select
          value={tempSearchParams.type}
          placeholder='请选择商品状态'
          style={{ width: '264px' }}
          allowClear
          onChange={(val) => handleUpdateSearchParam('type', val)}
        >
          <Select.Option value={1}>未发货</Select.Option>
          <Select.Option value={2}>已发货</Select.Option>
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
      </div>
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
        />
      </div>
    </>
  )
}
