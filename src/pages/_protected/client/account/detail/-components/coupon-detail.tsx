import { Button, Input, Select, Table } from '@arco-design/web-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { GetUserCouponsRes, getUserCoupons, UserCouponIsUse } from '@/api'
import { MyDatePicker } from '@/components/my-date-picker'
import { getUserCouponIsUseText } from '@/helpers/marketing'
import { defineTableColumns, formatDateTime, TableCellWidth } from '@/lib'

export function CouponDetail() {
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  type SearchParams = {
    discount_name?: string
    is_use?: UserCouponIsUse
    collection_range?: [number, number]
    use_range?: [number, number]
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

  const { data, isFetching } = useQuery({
    queryKey: ['user-coupons', searchParams, search.id],
    queryFn: () =>
      getUserCoupons({
        ...searchParams,
        collection_start_time: searchParams.collection_range?.[0],
        collection_end_time: searchParams.collection_range?.[1],
        use_start_time: searchParams.use_range?.[0],
        use_end_time: searchParams.use_range?.[1],
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
      <form
        className='flex-none flex flex-wrap gap-4 items-center mt-6'
        onSubmit={handleSubmit((values) => {
          console.log(values)
          setSearchParams(values)
        })}
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
          name='discount_name'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='请输入优惠券名称'
              style={{ width: '264px' }}
              suffix={<Search className='inline size-4' />}
            />
          )}
        />
        <Controller
          control={control}
          name='is_use'
          render={({ field }) => (
            <Select
              {...field}
              placeholder='请选择状态'
              style={{ width: '264px' }}
            >
              <Select.Option value={UserCouponIsUse.未使用}>
                未使用
              </Select.Option>
              <Select.Option value={UserCouponIsUse.已使用}>
                已使用
              </Select.Option>
              <Select.Option value={UserCouponIsUse.停止使用}>
                停止使用
              </Select.Option>
            </Select>
          )}
        />
        <Controller
          control={control}
          name='collection_range'
          render={({ field }) => (
            <MyDatePicker.RangePicker
              {...field}
              placeholder={['领取开始时间', '领取结束时间']}
              style={{ width: '264px' }}
            />
          )}
        />
        <Controller
          control={control}
          name='use_range'
          render={({ field }) => (
            <MyDatePicker.RangePicker
              {...field}
              placeholder={['使用开始时间', '使用结束时间']}
              style={{ width: '264px' }}
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
