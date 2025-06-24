import dayjs from 'dayjs'
import { RotateCcw, Search } from 'lucide-react'
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

import { GetUserCouponsRes, UserCouponIsUse, getUserCoupons } from '@/api'
import { getUserCouponIsUseText } from '@/helpers/marketing'
import { TableCellWidth, defineTableColumns, formatDateTime } from '@/lib'

export function CouponDetail() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    discount_name?: string
    is_use?: UserCouponIsUse
    collection_start_time?: number
    collection_end_time?: number
    use_start_time?: number
    use_end_time?: number
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
    queryKey: ['user-coupons', searchParams, search.id],
    queryFn: () =>
      getUserCoupons({
        ...searchParams,
        user_id: search.id
      })
  })

  const { columns, totalWidth } = defineTableColumns<GetUserCouponsRes>([
    {
      title: '优惠券名称',
      dataIndex: 'discount_name',
      align: 'center',
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'type_name',
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '状态',
      render: (_, item) => getUserCouponIsUseText(item.is_use),
      align: 'center',
      width: 120,
      ellipsis: true
    },
    {
      title: '领取时间',
      render: (_, item) => formatDateTime(item.collection_time),
      align: 'center',
      width: TableCellWidth.datetime,
      ellipsis: true
    },
    {
      title: '使用时间',
      render: (_, item) => formatDateTime(item.use_time),
      align: 'center',
      width: TableCellWidth.datetime,
      ellipsis: true
    },
    {
      title: '优惠券内容',
      dataIndex: 'offer_content',
      align: 'center',
      width: 240,
      ellipsis: true
    },
    {
      title: '活动时间',
      render: (_, item) => formatDateTime(item.etime),
      align: 'center',
      width: TableCellWidth.datetime,
      ellipsis: true
    }
  ])

  return (
    <>
      <div className='flex-none flex flex-wrap gap-4 items-center mt-6'>
        <Input
          value={tempSearchParams.discount_name}
          placeholder='请输入优惠券名称'
          style={{ width: '264px' }}
          allowClear
          suffix={<Search className='inline size-4' />}
          onChange={(val) => handleUpdateSearchParam('discount_name', val)}
        />
        <Select
          value={tempSearchParams.is_use}
          placeholder='请选择状态'
          style={{ width: '264px' }}
          allowClear
          onChange={(val) => handleUpdateSearchParam('is_use', val)}
        >
          <Select.Option value={UserCouponIsUse.未使用}>未使用</Select.Option>
          <Select.Option value={UserCouponIsUse.已使用}>已使用</Select.Option>
          <Select.Option value={UserCouponIsUse.停止使用}>
            停止使用
          </Select.Option>
        </Select>
        <DatePicker.RangePicker
          value={
            tempSearchParams.collection_start_time &&
            tempSearchParams.collection_end_time
              ? [
                  dayjs.unix(tempSearchParams.collection_start_time),
                  dayjs.unix(tempSearchParams.collection_end_time)
                ]
              : undefined
          }
          placeholder={['领取开始时间', '领取结束时间']}
          style={{ width: '264px' }}
          onChange={(val) => {
            if (!(val as string[] | undefined)) {
              setTempSearchParams((prev) => ({
                ...prev,
                collection_start_time: undefined,
                collection_end_time: undefined
              }))
            } else {
              setTempSearchParams((prev) => ({
                ...prev,
                collection_start_time: dayjs(val[0]).unix(),
                collection_end_time: dayjs(val[1]).unix()
              }))
            }
          }}
        />
        <DatePicker.RangePicker
          value={
            tempSearchParams.use_start_time && tempSearchParams.use_end_time
              ? [
                  dayjs.unix(tempSearchParams.use_start_time),
                  dayjs.unix(tempSearchParams.use_end_time)
                ]
              : undefined
          }
          placeholder={['使用开始时间', '使用结束时间']}
          style={{ width: '264px' }}
          onChange={(val) => {
            if (!(val as string[] | undefined)) {
              setTempSearchParams((prev) => ({
                ...prev,
                use_start_time: undefined,
                use_end_time: undefined
              }))
            } else {
              setTempSearchParams((prev) => ({
                ...prev,
                use_start_time: dayjs(val[0]).unix(),
                use_end_time: dayjs(val[1]).unix()
              }))
            }
          }}
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
          rowKey='id'
          data={data?.items ?? []}
          loading={isPending}
          columns={columns}
          borderCell
          scroll={{ x: totalWidth + 240 }}
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
