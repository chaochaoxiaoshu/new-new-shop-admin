import { useSize } from 'ahooks'
import dayjs from 'dayjs'
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  ChartPie,
  type LucideIcon,
  Monitor,
  PersonStanding,
  Settings,
  Store
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'

import { DatePicker, Divider, Select, Spin, Tooltip } from '@arco-design/web-react'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { getCustomersStatistic, getOrdersStatistic, getShopOrderData, getTodoBoard } from '@/api'
import todo0 from '@/assets/home/todo_0.png'
import todo1 from '@/assets/home/todo_1.png'
import todo2 from '@/assets/home/todo_2.png'
import todo3 from '@/assets/home/todo_3.png'
import { completeDateFormat } from '@/lib'
import { queryClient } from '@/lib'
import { useUserStore } from '@/stores'

type Precision = 'year' | 'month' | 'day'

const toboBoardQueryOptions = queryOptions({
  queryKey: ['todo-board'],
  queryFn: () =>
    getTodoBoard({
      department_id: useUserStore.getState().departmentId!
    })
})

const ordersStatisticQueryOptions = queryOptions({
  queryKey: ['orders-statistic'],
  queryFn: () =>
    getOrdersStatistic({
      department: useUserStore.getState().departmentId!
    })
})

const customersStatisticQueryOptions = queryOptions({
  queryKey: ['customers-statistic'],
  queryFn: () =>
    getCustomersStatistic({
      department: useUserStore.getState().departmentId!
    })
})

function getDataQueryOptions(precision: Precision, date: string, by?: 'store' | 'customer') {
  const precisionMap = {
    day: 1,
    month: 2,
    year: 3
  } as const

  return queryOptions({
    queryKey: ['store-data', precision, date, by],
    queryFn: () =>
      getShopOrderData({
        type: precisionMap[precision],
        date: completeDateFormat(date),
        department_id: useUserStore.getState().departmentId!
      })
  })
}

export const Route = createFileRoute('/_protected/')({
  loader: () => {
    void queryClient.prefetchQuery(toboBoardQueryOptions)
    void queryClient.prefetchQuery(ordersStatisticQueryOptions)
    void queryClient.prefetchQuery(customersStatisticQueryOptions)
    void queryClient.prefetchQuery(getDataQueryOptions('day', dayjs(new Date()).format('YYYY-MM-DD')))
  },
  component: HomeView
})

function HomeView() {
  return (
    <div className='min-w-[600px]'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4'>
        <div className='flex-1 flex flex-col mt-6 space-y-3'>
          <div className='flex-none font-medium'>待办事项</div>
          <TodoBoard />
        </div>
        <div className='flex-1 flex flex-col mt-6 space-y-3'>
          <div className='flex-none font-medium'>快捷入口</div>
          <Shortcuts />
        </div>
      </div>
      <div className='flex flex-col mt-6 space-y-3'>
        <div className='grid grid-cols-1 2xl:grid-cols-2 2xl:grid-rows-11 gap-4'>
          <StoreData />
          <StatisticCharts />
          <CustomerData />
        </div>
      </div>
    </div>
  )
}

function TodoBoard() {
  const { data, isPending } = useQuery(toboBoardQueryOptions)

  return (
    <Spin loading={isPending}>
      <div className='flex-auto grid grid-cols-2 2xl:grid-cols-4 bg-white rounded-md overflow-hidden'>
        <TodoBoardItem iconUrl={todo0} label='待支付' unit='个'>
          {data?.unpaid_count ?? 0}
        </TodoBoardItem>
        <TodoBoardItem iconUrl={todo1} label='待发货' unit='个'>
          {data?.unship_count ?? 0}
        </TodoBoardItem>
        <TodoBoardItem iconUrl={todo2} label='待售后' unit='个'>
          {data?.after_sales_count ?? 0}
        </TodoBoardItem>
        <TodoBoardItem iconUrl={todo3} label='库存报警' unit='个'>
          {data?.total_warn ?? 0}
        </TodoBoardItem>
      </div>
    </Spin>
  )
}

interface TodoBoardItemProps {
  iconUrl: string
  label: string
  unit: string
  children: React.ReactNode
}

function TodoBoardItem(props: TodoBoardItemProps) {
  const { iconUrl, label, unit, children } = props

  return (
    <div className='flex-1 flex space-x-3 p-5'>
      <img className='size-[52px]' src={iconUrl} />
      <div className='flex-auto flex flex-col justify-between py-0.5'>
        <span className='text-xs'>{label}</span>
        <div className='flex items-center space-x-1'>
          <span className='text-[22px]'>{children}</span>
          <span className='text-xs'>{unit}</span>
        </div>
      </div>
    </div>
  )
}

function Shortcuts() {
  return (
    <div className='flex-auto grid grid-cols-6 lg:grid-cols-4 2xl:grid-cols-8 py-2 lg:py-0 2xl:px-2 bg-white rounded-md overflow-hidden'>
      <ShortcutsItem destination='/commodity/merchandiseCon' icon={Store} label='商品'></ShortcutsItem>
      <ShortcutsItem destination='/order' icon={BriefcaseBusiness} label='订单'></ShortcutsItem>
      <ShortcutsItem destination='/order/billLading' icon={BriefcaseBusiness} label='自提单'></ShortcutsItem>
      <ShortcutsItem destination='/client/account' icon={ChartPie} label='会员'></ShortcutsItem>
      <ShortcutsItem destination='/setting/notice' icon={Monitor} label='公告'></ShortcutsItem>
      <ShortcutsItem destination='/setting/manage' icon={Settings} label='平台设置'></ShortcutsItem>
    </div>
  )
}

interface ShortcutsItemProps {
  destination: string
  icon: LucideIcon
  label: string
}

function ShortcutsItem(props: ShortcutsItemProps) {
  const { destination, label } = props
  return (
    <div className='flex-1 flex items-center justify-center'>
      <Link
        to={destination}
        className='group flex flex-col justify-center items-center space-y-2 size-20 hover:bg-[var(--color-fill-1)] rounded-md cursor-pointer'
      >
        <div className='flex justify-center items-center size-8 bg-[var(--color-fill-1)] group-hover:bg-white rounded-md'>
          <props.icon className='size-4' />
        </div>
        <span className='text-xs'>{label}</span>
      </Link>
    </div>
  )
}

function StoreData() {
  const [precision, setPrecision] = useState<Precision>('day')
  const [date, setDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
  /**
   * 日期字符串不满足 YYYY-MM-DD 格式时补全至 YYYY-MM-DD
   */
  const completedDate = completeDateFormat(date)

  const { data, isPending } = useQuery(getDataQueryOptions(precision, date, 'store'))

  return (
    <Spin loading={isPending} className='row-span-6'>
      <div className='flex flex-col p-4 h-full bg-white rounded-md overflow-hidden'>
        <div className='flex-none flex items-center justify-between'>
          <div className='font-medium'>店铺数据</div>
          <div className='flex'>
            <div className='flex-2'>
              <Select value={precision} size='mini' onChange={(val) => setPrecision(val)}>
                <Select.Option value='day'>按日搜索</Select.Option>
                <Select.Option value='month'>按月搜索</Select.Option>
                <Select.Option value='year'>按年搜索</Select.Option>
              </Select>
            </div>
            <div className='flex-3'>
              {precision === 'day' && (
                <DatePicker
                  value={completedDate}
                  size='mini'
                  format='YYYY-MM-DD'
                  allowClear={false}
                  onChange={(val) => setDate(val)}
                />
              )}
              {precision === 'month' && (
                <DatePicker.MonthPicker
                  value={completedDate}
                  size='mini'
                  format='YYYY-MM'
                  allowClear={false}
                  onChange={(val) => setDate(val)}
                />
              )}
              {precision === 'year' && (
                <DatePicker.YearPicker
                  value={completedDate}
                  size='mini'
                  format='YYYY'
                  allowClear={false}
                  onChange={(val) => setDate(val)}
                />
              )}
            </div>
          </div>
        </div>
        <div className='flex-auto mt-3 grid grid-cols-1 xl:grid-cols-2 gap-x-4'>
          <StoreDataItem
            label='支付金额'
            yoy={data?.payed_amount_yoy}
            qoq={data?.payed_amount_qoq}
            tip-text='支付成功的金额（含退款）'
            show-border
          >
            {data?.payed_amount ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='复购率'
            yoy={data?.repurchase_rate_yoy}
            qoq={data?.repurchase_rate_qoq}
            tip-text='（重复购买顾客人数/总顾客人数）×100%，其中重复购买次数>1时就累计'
          >
            {data?.repurchase_rate ? `${data?.repurchase_rate}%` : '0%'}
          </StoreDataItem>
          <StoreDataItem
            label='支付订单数'
            yoy={data?.payed_order_num_yoy}
            qoq={data?.payed_order_num_qoq}
            tip-text='支付成功的订单数'
            show-border
          >
            {data?.payed_order_num ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='营业额'
            yoy={data?.sales_amount_yoy}
            qoq={data?.sales_amount_qoq}
            tip-text='当日支付成功的金额 - 当日退款成功的金额'
          >
            {data?.sales_amount ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='浏览量'
            yoy={data?.view_num_yoy}
            qoq={data?.view_num_qoq}
            tip-text='访问本事业部下商品详情页'
            show-border
          >
            {data?.view_num ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='访客数'
            yoy={data?.visitor_num_yoy}
            qoq={data?.visitor_num_qoq}
            tip-text='访问本事业部下商品详情页'
          >
            {data?.visitor_num ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='客单价'
            yoy={data?.average_order_value_yoy}
            qoq={data?.average_order_value_qoq}
            tip-text='支付金额/支付人数'
            show-border
          >
            {data?.average_order_value ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='支付人数'
            yoy={data?.payed_user_num_yoy}
            qoq={data?.payed_user_num_qoq}
            tip-text='支付成功的客户数'
          >
            {data?.payed_user_num ?? 0}
          </StoreDataItem>
          <StoreDataItem
            label='支付转化率'
            yoy={data?.conversion_rate_yoy}
            qoq={data?.conversion_rate_qoq}
            tip-text='支付人数/访客数×100%'
            show-border
          >
            {data?.conversion_rate ? `${data?.conversion_rate}%` : '0%'}
          </StoreDataItem>
          <StoreDataItem label='佣金发放' hide-yoy-qoq tip-text='佣金成功发放总额'>
            {data?.distribution_total ?? 0}
          </StoreDataItem>
        </div>
      </div>
    </Spin>
  )
}

interface StoreDataItemProps {
  label: string
  yoy?: number
  qoq?: number
  hideYoyQoq?: boolean
  tipText?: string
  showBorder?: boolean
  children: React.ReactNode
}

function StoreDataItem(props: StoreDataItemProps) {
  const { label, yoy, qoq, hideYoyQoq, tipText, showBorder, children } = props
  return (
    <div className='relative flex items-center min-h-14'>
      {showBorder && (
        <div className='hidden xl:block absolute inset-y-3 right-0 w-[1px] bg-[var(--color-fill-3)]'></div>
      )}
      <div className='flex-auto flex flex-col'>
        <div className='text-base'>{children}</div>
        <div className='flex items-center text-xs text-[var(--color-text-2)]'>
          <div className='flex items-center'>
            <span className='text-nowrap'>{label}</span>
            <Tooltip content={tipText}>
              <img className='ml-1 size-3' src='https://qiniu.zdjt.com/shop/1NmkY7J1u5a82I4JYd6IpfqEkzu3APh6t0.png' />
            </Tooltip>
          </div>
          {!hideYoyQoq && (
            <>
              <div className='flex items-center ml-auto space-x-1 min-w-[100px]'>
                <span>同比</span>
                <span className='text-[var(--color-text-1)] font-medium'>{yoy ? `${yoy}%` : '-'}</span>
                {typeof yoy !== 'undefined' && (
                  <>
                    {yoy > 0 && <ArrowUp className='flex-none size-4 text-[rgb(var(--primary-6))]' />}
                    {yoy < 0 && <ArrowDown className='flex-none size-4 text-green-500' />}
                  </>
                )}
              </div>
              <div className='flex items-center space-x-1 min-w-[100px]'>
                <span>环比</span>
                <span className='text-[var(--color-text-1)] font-medium'>{qoq ? `${qoq}%` : '-'}</span>
                {typeof qoq !== 'undefined' && (
                  <>
                    {qoq > 0 && <ArrowUp className='flex-none size-4 text-[rgb(var(--primary-6))]' />}
                    {qoq < 0 && <ArrowDown className='flex-none size-4 text-green-500' />}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatisticCharts() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const containerSize = useSize(containerRef)

  const chartWidth = (() => {
    if (!containerSize) return 0
    return containerSize.width - 32
  })()

  const chartHeight = (() => {
    if (!containerSize) return 0
    const mediaQuery = window.matchMedia('(width >= 96rem)')
    if (mediaQuery.matches) {
      return 232
    } else {
      return containerSize.width * 0.3
    }
  })()

  const { data: ordersStatistic, isPending: ordersStatisticPending } = useQuery(ordersStatisticQueryOptions)
  const { data: customersStatistic, isPending: customersStatisticPending } = useQuery(customersStatisticQueryOptions)

  return (
    <div ref={containerRef} className='lg:row-span-11 flex flex-col p-4 bg-white rounded-md'>
      <div className='flex items-center justify-between mb-6'>
        <div className='font-medium'>最近七天订单量统计</div>
      </div>
      <Spin loading={ordersStatisticPending}>
        <AreaChart width={chartWidth} height={chartHeight} data={ordersStatistic?.items ?? []}>
          <defs>
            <linearGradient id='colorShip' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#504AE8' stopOpacity={0.2} />
              <stop offset='95%' stopColor='#504AE8' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorPay' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#f86b52' stopOpacity={0.2} />
              <stop offset='95%' stopColor='#f86b52' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke='#e5e7eb' strokeDasharray='3 3' />
          <XAxis
            dataKey='date'
            stroke='#6b7280'
            interval={0}
            height={20}
            padding={{ left: 12, right: 12 }}
            fontSize={12}
            tickFormatter={(value) => dayjs(value as string).format('MM-DD')}
          />
          <YAxis width={16} interval={0} stroke='#6b7280' allowDecimals={false} fontSize={12} />
          <Tooltip />
          <Legend />
          <Area
            type='monotone'
            dataKey='ship_total'
            name='已发货'
            fillOpacity={1}
            fill='url(#colorShip)'
            stroke='#504AE8'
            strokeWidth={2.5}
          />
          <Area
            type='monotone'
            dataKey='pay_total'
            name='已支付'
            fillOpacity={1}
            fill='url(#colorPay)'
            stroke='#f86b52'
            strokeWidth={2.5}
          />
        </AreaChart>
      </Spin>
      <Divider style={{ margin: '2.25rem 0' }} />
      <div className='flex items-center justify-between mb-6'>
        <div className='font-medium'>会员统计</div>
      </div>
      <Spin loading={customersStatisticPending}>
        <BarChart width={chartWidth} height={chartHeight} data={customersStatistic?.items ?? []}>
          <CartesianGrid stroke='#e5e7eb' strokeDasharray='3 3' />
          <XAxis
            dataKey='date'
            stroke='#6b7280'
            interval={0}
            height={20}
            fontSize={12}
            tickFormatter={(value) => dayjs(value as string).format('MM-DD')}
          />
          <YAxis width={16} interval={0} stroke='#6b7280' allowDecimals={false} fontSize={12} />
          <Tooltip />
          <Legend />
          <Bar dataKey='active_total' name='活跃' fill='#504AE8' />
          <Bar dataKey='add_total' name='新增' fill='#f86b52' />
        </BarChart>
      </Spin>
    </div>
  )
}

function CustomerData() {
  const [precision, setPrecision] = useState<Precision>('day')
  const [date, setDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
  /**
   * 日期字符串不满足 YYYY-MM-DD 格式时补全至 YYYY-MM-DD
   */
  const completedDate = completeDateFormat(date)

  const { data, isPending } = useQuery(getDataQueryOptions(precision, date, 'customer'))

  return (
    <Spin loading={isPending} className='row-span-5'>
      <div className='flex flex-col p-4 h-full bg-white rounded-md overflow-hidden'>
        <div className='flex items-center justify-between'>
          <div className='font-medium'>客户数据</div>
          <div className='flex'>
            <div className='flex-2'>
              <Select value={precision} size='mini' onChange={(val) => setPrecision(val)}>
                <Select.Option value='day'>按日搜索</Select.Option>
                <Select.Option value='month'>按月搜索</Select.Option>
                <Select.Option value='year'>按年搜索</Select.Option>
              </Select>
            </div>
            <div className='flex-3'>
              {precision === 'day' && (
                <DatePicker
                  value={completedDate}
                  size='mini'
                  format='YYYY-MM-DD'
                  allowClear={false}
                  onChange={(val) => setDate(val)}
                />
              )}
              {precision === 'month' && (
                <DatePicker.MonthPicker
                  value={completedDate}
                  size='mini'
                  format='YYYY-MM'
                  allowClear={false}
                  onChange={(val) => setDate(val)}
                />
              )}
              {precision === 'year' && (
                <DatePicker.YearPicker
                  value={completedDate}
                  size='mini'
                  format='YYYY'
                  allowClear={false}
                  onChange={(val) => setDate(val)}
                />
              )}
            </div>
          </div>
        </div>
        <div className='flex-auto mt-3 flex flex-col'>
          <CustomerDataItem
            icon={PersonStanding}
            iconBackgroundColor='#FB7D5B'
            label='新成交客户数'
            yoy={data?.new_user_num_yoy}
            qoq={data?.new_user_num_qoq}
          >
            {data?.new_user_num || '-'}
          </CustomerDataItem>
          <CustomerDataItem
            icon={PersonStanding}
            iconBackgroundColor='#FCC43E'
            label='新成交客户支付'
            yoy={data?.new_user_payed_yoy}
            qoq={data?.new_user_payed_qoq}
          >
            {data?.new_user_payed || '-'}
          </CustomerDataItem>
          <CustomerDataItem
            icon={PersonStanding}
            iconBackgroundColor='#4D44B5'
            label='老成交客户数'
            yoy={data?.old_user_num_yoy}
            qoq={data?.old_user_num_qoq}
          >
            {data?.old_user_num || '-'}
          </CustomerDataItem>
          <CustomerDataItem
            icon={PersonStanding}
            iconBackgroundColor='#FCC43E'
            label='老成交客户支付'
            yoy={data?.old_user_payed_yoy}
            qoq={data?.old_user_payed_qoq}
          >
            {data?.old_user_payed || '-'}
          </CustomerDataItem>
        </div>
      </div>
    </Spin>
  )
}

interface CustomerDataItemProps {
  icon: LucideIcon
  iconBackgroundColor: string
  label: string
  yoy?: number
  qoq?: number
  children: React.ReactNode
}

function CustomerDataItem(props: CustomerDataItemProps) {
  const { iconBackgroundColor, label, yoy, qoq, children } = props
  return (
    <div className='flex-1 flex items-center min-h-14'>
      <div
        className='flex-none flex justify-center items-center size-8 rounded-full bg-[#FFF5F2]'
        style={{ backgroundColor: iconBackgroundColor }}
      >
        <props.icon className='text-white size-4' />
      </div>
      <span className='ml-4 text-xs text-[var(--color-text-2)] w-48'>{label}</span>
      <span className='text-base text-[var(--color-text-1)]'>{children}</span>
      <div className='flex items-center ml-auto space-x-1 text-xs text-[var(--color-text-2)] w-[100px]'>
        <span>同比</span>
        <span className='text-[var(--color-text-1)] font-medium'>{yoy ? `${yoy}%` : '-'}</span>
        {typeof yoy !== 'undefined' && (
          <>
            {yoy > 0 && <ArrowUp className='flex-none size-4 text-[rgb(var(--primary-6))]' />}
            {yoy < 0 && <ArrowDown className='flex-none size-4 text-green-500' />}
          </>
        )}
      </div>
      <div className='flex items-center space-x-1 text-xs text-[var(--color-text-2)] w-[100px]'>
        <span>环比</span>
        <span className='text-[var(--color-text-1)] font-medium'>{qoq ? `${qoq}%` : '-'}</span>
        {typeof qoq !== 'undefined' && (
          <>
            {qoq > 0 && <ArrowUp className='flex-none size-4 text-[rgb(var(--primary-6))]' />}
            {qoq < 0 && <ArrowDown className='flex-none size-4 text-green-500' />}
          </>
        )}
      </div>
    </div>
  )
}
