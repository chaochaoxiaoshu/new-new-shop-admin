import {
  Button,
  Divider,
  Message,
  Select,
  Spin,
  Table
} from '@arco-design/web-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useRouteContext, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { GetCouponsRes, getCoupons, giveCoupon } from '@/api'
import customerDetail0 from '@/assets/customer/customer_detail_0.png'
import customerDetail1 from '@/assets/customer/customer_detail_1.png'
import customerDetail2 from '@/assets/customer/customer_detail_2.png'
import { getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import { defineTableColumns, formatDateTime } from '@/lib'

export function Overview() {
  const context = useRouteContext({
    from: '/_protected/client/account/detail/'
  })
  const search = useSearch({ from: '/_protected/client/account/detail/' })
  const navigate = useNavigate()
  const [openModal, contextHolder] = useMyModal()

  const { data: consumptionData, isPending: consumptionPending } = useQuery(
    context.customerProfileQueryOptions
  )
  const { data: accountData, isPending: accountPending } = useQuery(
    context.customerPropertyQueryOptions
  )
  const { data: promotionData, isPending: promotionPending } = useQuery(
    context.customerPromotionQueryOptions
  )

  const handleGiveCoupon = () => {
    const modalIns = openModal({
      title: '赠送优惠券',
      content: (
        <GiveCouponForm
          onSuccess={() => {
            // [TODO]: 刷新优惠券列表
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 900 }
    })
  }

  const handleViewPrizeDetail = () => {
    openModal({
      title: '奖品详情',
      content: <PrizeDetail />
    })
  }

  const [promotionViewMode, setPromotionViewMode] = useState<
    'overview' | 'detail'
  >('overview')

  return (
    <>
      <Spin loading={consumptionPending} style={{ width: '100%' }}>
        <div className='flex items-center mt-6'>
          <img src={customerDetail0} className='size-4 mr-2' />
          <span className='font-semibold'>消费信息</span>
        </div>
        <OverviewRow title='最近消费'>
          <OverviewItem label='最近实付金额'>
            {' '}
            ¥ {consumptionData?.last_order?.last_order_amount ?? '-'}{' '}
          </OverviewItem>
          <OverviewItem label='购买商品件数' unit='件'>
            {consumptionData?.last_order?.last_order_num ?? '-'}
          </OverviewItem>
          <div className='self-end w-1/5 text-sm space-y-2'>
            <div>
              {consumptionData?.last_order?.last_order_time
                ? formatDateTime(consumptionData.last_order.last_order_time)
                : '-'}
            </div>
            <div>最近消费时间</div>
          </div>
        </OverviewRow>
        <Divider style={{ margin: 0 }} />
        <OverviewRow
          titleView={
            <div className='font-bold text-sm'>
              <span>累计消费</span>
              <span
                className='ml-4 text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-7))] transition-colors cursor-pointer'
                onClick={() =>
                  navigate({
                    from: '/client/account/detail',
                    search: { ...search, tab: 'transaction-detail' }
                  })
                }
              >
                订单明细
              </span>
            </div>
          }
        >
          <OverviewItem label='累计订单金额'>
            ¥
            {consumptionData?.accumulated_consumption?.total_order_amount ??
              '-'}
          </OverviewItem>
          <OverviewItem label='累计实付金额'>
            ¥
            {consumptionData?.accumulated_consumption?.total_payed_amount ??
              '-'}
          </OverviewItem>
          <OverviewItem label='累计优惠金额'>
            ¥
            {consumptionData?.accumulated_consumption?.total_discount_amount ??
              '-'}
          </OverviewItem>
          <OverviewItem label='累计消费单数' unit='笔'>
            {consumptionData?.accumulated_consumption?.total_order_num ?? '-'}
          </OverviewItem>
          <OverviewItem label='累计消费商品数' unit='件'>
            {consumptionData?.accumulated_consumption?.total_goods_num ?? '-'}
          </OverviewItem>
        </OverviewRow>
        <Divider style={{ margin: 0 }} />
        <OverviewRow title='消费分析'>
          <OverviewItem label='笔单价'>
            ¥ {consumptionData?.consumption_sanalysis?.ave_order_amount ?? '-'}
          </OverviewItem>
          <OverviewItem label='笔商品数' unit='件/笔'>
            {consumptionData?.consumption_sanalysis?.ave_goods_num ?? '-'}
          </OverviewItem>
          <OverviewItem label='消费频次' unit='笔/天'>
            {consumptionData?.consumption_sanalysis?.purchase_rate ?? '-'}
          </OverviewItem>
        </OverviewRow>
        <Divider style={{ margin: 0 }} />
        <OverviewRow title='售后分析'>
          <OverviewItem label='累计退款金额'>
            {consumptionData?.sales_analysis?.total_refund_amount ?? '-'}
          </OverviewItem>
          <OverviewItem label='累计售后订单数' unit='笔'>
            {consumptionData?.sales_analysis?.total_aftersales_num ?? '-'}
          </OverviewItem>
          <OverviewItem label='累计售后申请率'>
            {consumptionData?.sales_analysis?.aftersales_rate ?? '-'}%
          </OverviewItem>
        </OverviewRow>
      </Spin>
      <Divider style={{ margin: 0 }} />
      <div className='flex items-center mt-10'>
        <img src={customerDetail1} className='size-4 mr-2' />
        <span className='font-semibold'>资产信息</span>
      </div>
      <Spin loading={accountPending} style={{ width: '100%' }}>
        <OverviewRow
          titleView={
            <div className='font-semibold text-sm'>
              <span>优惠券</span>
              <span
                className='ml-4 text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-7))] transition-colors cursor-pointer'
                onClick={handleGiveCoupon}
              >
                送券
              </span>
              <span
                className='ml-4 text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-7))] transition-colors cursor-pointer'
                onClick={() =>
                  navigate({
                    from: '/client/account/detail',
                    search: { ...search, tab: 'coupon-detail' }
                  })
                }
              >
                明细
              </span>
            </div>
          }
        >
          <OverviewItem label='可用优惠券' unit='张'>
            {accountData?.user_discount?.available_discount_num ?? '-'}
          </OverviewItem>
          <OverviewItem label='已使用' unit='张'>
            {accountData?.user_discount?.used_discount_num ?? '-'}
          </OverviewItem>
          <OverviewItem label='已失效' unit='张'>
            {accountData?.user_discount?.invalid_discount_num ?? '-'}
          </OverviewItem>
        </OverviewRow>
        <Divider style={{ margin: 0 }} />
        <OverviewRow title='钱包余额'>
          <OverviewItem label='可用余额'>
            {' '}
            ¥ {accountData?.user_wallet?.balance ?? '-'}{' '}
          </OverviewItem>
          <OverviewItem label='已提现总额'>
            {' '}
            ¥ {accountData?.user_wallet?.total_payed_amount ?? '-'}{' '}
          </OverviewItem>
        </OverviewRow>
        <Divider style={{ margin: 0 }} />
        <OverviewRow
          titleView={
            <div className='font-semibold text-sm'>
              <span>奖品</span>
              <span
                className='ml-4 text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-7))] transition-colors cursor-pointer'
                onClick={handleViewPrizeDetail}
              >
                明细
              </span>
            </div>
          }
        >
          <OverviewItem label='待领取奖品' unit='个'>
            {accountData?.user_prize?.d_status ?? '-'}
          </OverviewItem>
          <OverviewItem label='已领取奖品' unit='个'>
            {accountData?.user_prize?.y_status ?? '-'}
          </OverviewItem>
          <OverviewItem label='已过期奖品' unit='个'>
            {accountData?.user_prize?.g_status ?? '-'}
          </OverviewItem>
        </OverviewRow>
      </Spin>
      <Divider style={{ margin: 0 }} />
      <div className='flex items-center mt-10'>
        <img src={customerDetail2} className='size-4 mr-2' />
        <span className='font-semibold'>活动信息</span>
        <Select
          value={promotionViewMode}
          options={[
            { label: '概览', value: 'overview' },
            { label: '详情', value: 'detail' }
          ]}
          trigger='click'
          triggerElement={
            <span className='font-semibold min-w-20 text-sm ml-4 text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-7))] transition-colors cursor-pointer'>
              {promotionViewMode === 'overview' ? '概览' : '详情'}
            </span>
          }
          onChange={setPromotionViewMode}
        />
      </div>
      <Spin loading={promotionPending} style={{ width: '100%' }}>
        {promotionViewMode === 'overview' ? (
          <>
            <OverviewRow title='活动统计'>
              <OverviewItem label='秒杀' unit='次'>
                {promotionData?.seckill?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='拼团' unit='次'>
                {promotionData?.teambuy?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='满减/送' unit='次'>
                {promotionData?.fullgift?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='N元N件' unit='次'>
                {promotionData?.value_pack?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='满减/邮' unit='次'>
                {promotionData?.reduction?.total_count ?? '-'}
              </OverviewItem>
            </OverviewRow>
            <Divider style={{ margin: 0 }} />
            <OverviewRow title='活动分析'>
              <OverviewItem label='活动订单总额'>
                {' '}
                ¥ {promotionData?.sum_info?.order_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动实付总额'>
                {' '}
                ¥ {promotionData?.sum_info?.payed_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动优惠'>
                {' '}
                ¥ {promotionData?.sum_info?.discount_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动总订单数' unit='笔'>
                {promotionData?.sum_info?.order_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='活动笔单价'>
                {' '}
                ¥ {promotionData?.sum_info?.unit_price ?? '-'}{' '}
              </OverviewItem>
            </OverviewRow>
          </>
        ) : (
          <>
            <OverviewRow title='秒杀'>
              <OverviewItem label='活动订单总额'>
                {' '}
                ¥ {promotionData?.seckill?.order_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动实付金额'>
                {' '}
                ¥ {promotionData?.seckill?.payed_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动优惠金额'>
                {' '}
                ¥ {promotionData?.seckill?.discount_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='参与活动总次数' unit='次'>
                {promotionData?.seckill?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='活动总订单数' unit='笔'>
                {promotionData?.seckill?.order_count ?? '-'}
              </OverviewItem>
            </OverviewRow>
            <OverviewRow>
              <OverviewItem label='活动笔单价'>
                {' '}
                ¥ {promotionData?.seckill?.unit_price ?? '-'}{' '}
              </OverviewItem>
            </OverviewRow>
            <Divider style={{ margin: 0 }} />
            <OverviewRow title='拼团'>
              <OverviewItem label='活动订单总额'>
                {' '}
                ¥ {promotionData?.teambuy?.order_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动实付总额'>
                {' '}
                ¥ {promotionData?.teambuy?.payed_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动优惠金额'>
                {' '}
                ¥ {promotionData?.teambuy?.discount_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='参与活动总次数' unit='次'>
                {promotionData?.teambuy?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='活动总订单数' unit='笔'>
                {promotionData?.teambuy?.order_count ?? '-'}
              </OverviewItem>
            </OverviewRow>
            <OverviewRow>
              <OverviewItem label='活动笔单价'>
                {' '}
                ¥ {promotionData?.teambuy?.unit_price ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='成团率'>
                {' '}
                {promotionData?.teambuy?.rate ?? '-'}%{' '}
              </OverviewItem>
            </OverviewRow>
            <Divider style={{ margin: 0 }} />
            <OverviewRow title='N元N件'>
              <OverviewItem label='活动订单总额'>
                {' '}
                ¥ {promotionData?.value_pack?.order_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动实付总额'>
                {' '}
                ¥ {promotionData?.value_pack?.payed_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动优惠金额'>
                {' '}
                ¥ {promotionData?.value_pack?.discount_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='参与活动总次数' unit='次'>
                {promotionData?.value_pack?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='活动总订单数' unit='笔'>
                {promotionData?.value_pack?.order_count ?? '-'}
              </OverviewItem>
            </OverviewRow>
            <OverviewRow>
              <OverviewItem label='活动笔单价'>
                {' '}
                ¥ {promotionData?.value_pack?.unit_price ?? '-'}{' '}
              </OverviewItem>
            </OverviewRow>
            <Divider style={{ margin: 0 }} />
            <OverviewRow title='满减/送'>
              <OverviewItem label='活动订单总额'>
                {' '}
                ¥ {promotionData?.fullgift?.order_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动实付总额'>
                {' '}
                ¥ {promotionData?.fullgift?.payed_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动优惠金额'>
                {' '}
                ¥ {promotionData?.fullgift?.discount_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='参与活动总次数' unit='次'>
                {promotionData?.fullgift?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='活动总订单数' unit='笔'>
                {promotionData?.fullgift?.order_count ?? '-'}
              </OverviewItem>
            </OverviewRow>
            <OverviewRow>
              <OverviewItem label='活动笔单价'>
                {' '}
                ¥ {promotionData?.fullgift?.unit_price ?? '-'}{' '}
              </OverviewItem>
            </OverviewRow>
            <Divider style={{ margin: 0 }} />
            <OverviewRow title='满减邮'>
              <OverviewItem label='活动订单总额'>
                {' '}
                ¥ {promotionData?.reduction?.order_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动实付总额'>
                {' '}
                ¥ {promotionData?.reduction?.payed_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='活动优惠金额'>
                {' '}
                ¥ {promotionData?.reduction?.discount_amount ?? '-'}{' '}
              </OverviewItem>
              <OverviewItem label='参与活动总次数' unit='次'>
                {promotionData?.reduction?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='活动总订单数' unit='笔'>
                {promotionData?.reduction?.order_count ?? '-'}
              </OverviewItem>
            </OverviewRow>
            <OverviewRow>
              <OverviewItem label='活动笔单价'>
                {' '}
                ¥ {promotionData?.reduction?.unit_price ?? '-'}{' '}
              </OverviewItem>
            </OverviewRow>
            <Divider style={{ margin: 0 }} />
            <OverviewRow title='幸运大抽奖'>
              <OverviewItem label='参与活动总次数' unit='次'>
                {promotionData?.raffle?.total_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='抽奖总次数' unit='次'>
                {promotionData?.raffle?.use_prize_count ?? '-'}
              </OverviewItem>
              <OverviewItem label='中奖率'>
                {' '}
                {promotionData?.raffle?.rate ?? '-'}%{' '}
              </OverviewItem>
            </OverviewRow>
          </>
        )}
        {contextHolder}
      </Spin>
    </>
  )
}

interface OverviewRowProps {
  title?: string
  titleView?: React.ReactNode
  children?: React.ReactNode
}

function OverviewRow(props: OverviewRowProps) {
  const { title, titleView, children } = props

  return (
    <div className='flex flex-col py-9'>
      {titleView ?? <div className='font-bold text-sm'>{title}</div>}
      <div className='mt-6 flex'>{children}</div>
    </div>
  )
}

interface OverviewItemProps {
  label: string
  unit?: string
  children?: React.ReactNode
}

function OverviewItem(props: OverviewItemProps) {
  const { label, unit, children } = props

  return (
    <div className='w-1/5'>
      <div className='flex items-baseline text-[rgb(var(--primary-6))] font-semibold'>
        <span className='text-2xl'>{children}</span>
        {unit && <span className='text-sm ml-2'>{unit}</span>}
      </div>
      <div className='mt-1 text-sm'>
        <span>{label}</span>
      </div>
    </div>
  )
}

interface GiveCouponFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

function GiveCouponForm(props: GiveCouponFormProps) {
  const { onSuccess, onCancel } = props
  const search = useSearch({ from: '/_protected/client/account/detail/' })

  const [pagination, setPagination] = useState({
    page_index: 1,
    page_size: 20
  })

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  const { data: coupons, isPending: couponsPending } = useQuery({
    queryKey: ['coupons', pagination],
    queryFn: () =>
      getCoupons({
        operate: 3,
        department: 1,
        settings: 2,
        ...pagination
      })
  })

  const { columns } = defineTableColumns<GetCouponsRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      ellipsis: true
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      ellipsis: true
    },
    {
      title: '优惠内容',
      dataIndex: 'contenttype',
      align: 'center',
      ellipsis: true
    },
    {
      title: '活动时间',
      render: (_, item) =>
        `${formatDateTime(item.stime)} - ${formatDateTime(item.etime)}`,
      align: 'center',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'operate',
      align: 'center',
      ellipsis: true
    },
    {
      title: '剩余',
      dataIndex: 'used',
      align: 'center',
      ellipsis: true
    },
    {
      title: '数量',
      dataIndex: 'total',
      align: 'center',
      ellipsis: true
    }
  ])

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationKey: ['give-coupon'],
    mutationFn: async () => {
      if (selectedRowKeys.length === 0) {
        Message.error('请选择优惠券')
        return
      }
      await Promise.all(
        selectedRowKeys.map((id) => giveCoupon({ user_id: search.id, id }))
      )
    },
    ...getNotifs({
      key: 'give-coupon',
      onSuccess
    })
  })

  return (
    <div>
      <Table
        rowKey='id'
        data={coupons?.items ?? []}
        loading={couponsPending}
        columns={columns}
        borderCell
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) =>
            setSelectedRowKeys(selectedRowKeys as number[])
        }}
        pagination={{
          current: coupons?.paginate.page_index,
          pageSize: coupons?.paginate.page_size,
          total: coupons?.paginate.total,
          onChange: (current, pageSize) => {
            setPagination({ page_index: current, page_size: pageSize })
          }
        }}
      />
      <div className='flex justify-end items-center space-x-4 mt-6'>
        <Button onClick={onCancel}>取消</Button>
        <Button
          loading={isPending}
          type='primary'
          onClick={() => handleSubmit()}
        >
          确定
        </Button>
      </div>
    </div>
  )
}

function PrizeDetail() {
  // [TODO]: 请求奖品列表

  const { columns } = defineTableColumns([
    {
      title: '奖品名称',
      align: 'center',
      dataIndex: ''
    },
    {
      title: '奖品',
      align: 'center',
      dataIndex: ''
    },
    {
      title: '参与活动',
      align: 'center',
      dataIndex: ''
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: ''
    }
  ])

  return <Table columns={columns} borderCell />
}
