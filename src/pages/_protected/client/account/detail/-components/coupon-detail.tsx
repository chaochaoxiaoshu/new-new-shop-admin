import { RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'

import { Button, Input, Select, Table } from '@arco-design/web-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

import { GetUserCouponsRes, UserCouponIsUse, getUserCoupons } from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
import { getUserCouponIsUseText } from '@/helpers/marketing'
import { paginationFields, useTempSearch } from '@/hooks'
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
  const { tempSearch, setTempSearch, updateSearchField, commit, reset } =
    useTempSearch({
      search: searchParams,
      updateFn: setSearchParams,
      selectDefaultFields: paginationFields
    })

  const { data, isFetching } = useQuery({
    queryKey: ['user-coupons', searchParams, search.id],
    queryFn: () =>
      getUserCoupons({
        ...searchParams,
        user_id: search.id
      }),
    placeholderData: keepPreviousData
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
          value={tempSearch.discount_name}
          placeholder='请输入优惠券名称'
          style={{ width: '264px' }}
          suffix={<Search className='inline size-4' />}
          onChange={(val) => updateSearchField('discount_name', val)}
        />
        <Select
          value={tempSearch.is_use}
          placeholder='请选择状态'
          style={{ width: '264px' }}
          onChange={(val) => updateSearchField('is_use', val as number)}
        >
          <Select.Option value={UserCouponIsUse.未使用}>未使用</Select.Option>
          <Select.Option value={UserCouponIsUse.已使用}>已使用</Select.Option>
          <Select.Option value={UserCouponIsUse.停止使用}>
            停止使用
          </Select.Option>
        </Select>
        <MyDatePicker.RangePicker
          value={[
            tempSearch.collection_start_time,
            tempSearch.collection_end_time
          ]}
          placeholder={['领取开始时间', '领取结束时间']}
          style={{ width: '264px' }}
          onChange={(val) => {
            setTempSearch((prev) => ({
              ...prev,
              collection_start_time: val?.[0],
              collection_end_time: val?.[1]
            }))
          }}
        />
        <MyDatePicker.RangePicker
          value={[tempSearch.use_start_time, tempSearch.use_end_time]}
          placeholder={['使用开始时间', '使用结束时间']}
          style={{ width: '264px' }}
          onChange={(val) => {
            setTempSearch((prev) => ({
              ...prev,
              use_start_time: val?.[0],
              use_end_time: val?.[1]
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
          loading={isFetching}
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
