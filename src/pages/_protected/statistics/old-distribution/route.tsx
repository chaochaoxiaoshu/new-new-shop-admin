import { Button, Input, Message, Select, Tabs } from '@arco-design/web-react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation
} from '@tanstack/react-router'
import { type } from 'arktype'
import { FileText, RotateCcw, Search, Share } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { MyDatePicker } from '@/components/my-date-picker'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'
import { downloadFile, generateExportUrl } from '@/helpers'
import { cleanObject } from '@/lib'
import { useUserStore } from '@/stores'

export const Route = createFileRoute('/_protected/statistics/old-distribution')(
  {
    validateSearch: type({
      'order_id?': 'string',
      'p_mobile?': 'string',
      'range?': ['number', 'number'],
      'refund_range?': ['number', 'number'],
      'is_fenxiao?': 'number',
      'delivery?': 'number',
      'department_id?': 'number',
      page_index: 'number = 1',
      page_size: 'number = 20'
    }),
    beforeLoad: ({ location }) => {
      if (location.pathname === '/newmanage/statistics/old-distribution') {
        throw redirect({ to: '/statistics/old-distribution/order-dimension' })
      }
    },
    component: RouteComponent
  }
)

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const location = useLocation()

  const isGoodsDimension = location.pathname.includes('/goods-dimension')

  const { control, getValues, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const handleTabChange = (tabKey: 'order-dimension' | 'goods-dimension') => {
    if (tabKey === 'order-dimension') {
      navigate({ to: '/statistics/old-distribution/order-dimension' })
    } else {
      navigate({ to: '/statistics/old-distribution/goods-dimension' })
    }
    reset()
  }

  const handleExport = () => {
    if (!getValues('range')) {
      Message.warning({ content: '请先选择导出时间范围' })
      return
    }
    const url = isGoodsDimension
      ? generateExportUrl(
          '/jshop-report/api/v1/order-items/distribution-statistics/export',
          cleanObject({
            start_time: getValues('range')?.[0],
            end_time: getValues('range')?.[1],
            refund_start_time: getValues('refund_range')?.[0],
            refund_end_time: getValues('refund_range')?.[1],
            share_method: getValues('is_fenxiao'),
            delivery: getValues('delivery'),
            order_id: getValues('order_id'),
            p_mobile: getValues('p_mobile'),
            department_id:
              getValues('department_id') ||
              useUserStore.getState().departmentId!
          })
        )
      : generateExportUrl(
          '/jshop-report/api/v1/order/distribution-statistics/export',
          cleanObject({
            start_time: getValues('range')?.[0],
            end_time: getValues('range')?.[1],
            department_id:
              getValues('department_id') ||
              useUserStore.getState().departmentId!,
            share_method: getValues('is_fenxiao'),
            order_id: getValues('order_id')
          })
        )
    downloadFile(url)
  }

  return (
    <TableLayout
      className='p-0 pb-6'
      header={
        <>
          <Tabs
            activeTab={isGoodsDimension ? 'goods-dimension' : 'order-dimension'}
            onChange={(key) =>
              handleTabChange(key as 'order-dimension' | 'goods-dimension')
            }
          >
            <Tabs.TabPane
              key='order-dimension'
              title='订单维度统计'
            ></Tabs.TabPane>
            <Tabs.TabPane
              key='goods-dimension'
              title='商品维度统计'
            ></Tabs.TabPane>
          </Tabs>
          <form
            className='table-header px-4 pt-6'
            onSubmit={handleSubmit((values) =>
              navigate({
                to: isGoodsDimension
                  ? '/statistics/old-distribution/goods-dimension'
                  : '/statistics/old-distribution/order-dimension',
                search: values
              })
            )}
            onReset={() => {
              reset()
              navigate({
                to: isGoodsDimension
                  ? '/statistics/old-distribution/goods-dimension'
                  : '/statistics/old-distribution/order-dimension',
                search: {
                  page_index: search.page_index,
                  page_size: search.page_size
                }
              })
            }}
          >
            <Controller
              control={control}
              name='order_id'
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder='请输入订单号'
                  style={{ width: 264 }}
                  suffix={<FileText className='inline size-4' />}
                />
              )}
            />
            <Show when={isGoodsDimension}>
              <Controller
                control={control}
                name='p_mobile'
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder='请输入手机号'
                    style={{ width: 264 }}
                    suffix={<FileText className='inline size-4' />}
                  />
                )}
              />
            </Show>
            <Controller
              control={control}
              name='range'
              render={({ field }) => (
                <MyDatePicker.RangePicker {...field} style={{ width: 264 }} />
              )}
            />
            <Show when={isGoodsDimension}>
              <Controller
                control={control}
                name='refund_range'
                render={({ field }) => (
                  <MyDatePicker.RangePicker
                    {...field}
                    style={{ width: 264 }}
                    placeholder={['退款开始日期', '退款结束日期']}
                  />
                )}
              />
            </Show>
            <Controller
              control={control}
              name='is_fenxiao'
              render={({ field }) => (
                <Select
                  {...field}
                  style={{ width: 264 }}
                  placeholder='请选择是否分销'
                >
                  <Select.Option value={1}>分销</Select.Option>
                  <Select.Option value={2}>非分销</Select.Option>
                </Select>
              )}
            />
            <Show when={isGoodsDimension}>
              <Controller
                control={control}
                name='delivery'
                render={({ field }) => (
                  <Select
                    {...field}
                    style={{ width: 264 }}
                    placeholder='请选择配送方式'
                  >
                    <Select.Option value={1}>快递邮寄</Select.Option>
                    <Select.Option value={2}>门店自提</Select.Option>
                  </Select>
                )}
              />
            </Show>
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
            <Button
              type='outline'
              icon={<Share className='inline size-4' />}
              onClick={handleExport}
            >
              导出
            </Button>
          </form>
        </>
      }
    >
      <div className='flex-auto h-full px-4'>
        <Outlet />
      </div>
    </TableLayout>
  )
}
