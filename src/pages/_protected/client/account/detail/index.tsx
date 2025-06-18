import { type } from 'arktype'

import { Avatar, Button, Tabs } from '@arco-design/web-react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  getCustomerInfo,
  getCustomerProfile,
  getCustomerPromotion,
  getCustomerProperty
} from '@/api'
import { BaseLayout } from '@/components/base-layout'
import { MyTag } from '@/components/my-tag'
import { getHead } from '@/helpers'
import { formatDateTime, queryClient } from '@/lib'
import { useUserStore } from '@/stores'

import { Overview } from './-components/overview'

export const Route = createFileRoute('/_protected/client/account/detail/')({
  validateSearch: type({
    id: 'number'
  }),
  loaderDeps: ({ search }) => ({ id: search.id }),
  beforeLoad: ({ search }) => {
    return {
      customerInfoQueryOptions: queryOptions({
        queryKey: ['customer-info', search.id],
        queryFn: () =>
          getCustomerInfo({
            id: search.id,
            department: useUserStore.getState().departmentId!
          })
      }),
      customerProfileQueryOptions: queryOptions({
        queryKey: ['customer-profile', search.id],
        queryFn: () => getCustomerProfile({ user_id: search.id })
      }),
      customerPropertyQueryOptions: queryOptions({
        queryKey: ['customer-property', search.id],
        queryFn: () => getCustomerProperty({ user_id: search.id })
      }),
      customerPromotionQueryOptions: queryOptions({
        queryKey: ['customer-promotion', search.id],
        queryFn: () => getCustomerPromotion({ user_id: search.id })
      })
    }
  },
  loader: async ({ context }) => {
    queryClient.prefetchQuery(context.customerProfileQueryOptions)
    queryClient.prefetchQuery(context.customerPropertyQueryOptions)
    queryClient.prefetchQuery(context.customerPromotionQueryOptions)
    return queryClient.ensureQueryData(context.customerInfoQueryOptions)
  },
  head: () => getHead('客户详情'),
  component: CustomerDetailView,
  pendingComponent: BaseLayout
})

function CustomerDetailView() {
  const context = Route.useRouteContext()
  const { data } = useSuspenseQuery(context.customerInfoQueryOptions)

  return (
    <div className='min-w-[720px]'>
      <div className='rounded-md bg-white'>
        <Tabs>
          <Tabs.TabPane title='客户信息'>
            <div className='px-4 pb-6'>
              <div className='flex items-center space-x-4'>
                <Avatar>
                  <img src={data.avatar} />
                </Avatar>
                <div className='font-semibold'>{data.nickname || '-'}</div>
              </div>
              <div className='mt-5 flex flex-wrap gap-y-5'>
                <div className='w-[300px] text-sm'>
                  <span className='text-[var(--color-text-3)]'>客户来源：</span>
                  <span>{data.source || '-'}</span>
                </div>
                <div className='w-[300px] text-sm'>
                  <span className='text-[var(--color-text-3)]'>
                    客户手机号：
                  </span>
                  <span>{data.mobile || '-'}</span>
                </div>
                <div className='w-[300px] text-sm flex items-center'>
                  <span className='text-[var(--color-text-3)]'>客户身份：</span>
                  <span>{data.identity || '-'}</span>
                  <Button
                    type='outline'
                    size='mini'
                    style={{
                      height: '1.25rem',
                      marginLeft: '0.5rem',
                      padding: '0 0.25rem'
                    }}
                  >
                    变更
                  </Button>
                </div>
                <div className='w-[300px] text-sm flex items-center'>
                  <span className='text-[var(--color-text-3)]'>
                    归属分销员：
                  </span>
                  <span>{data.distributors || '-'}</span>
                  <Button
                    type='outline'
                    size='mini'
                    style={{
                      height: '1.25rem',
                      marginLeft: '0.5rem',
                      padding: '0 0.25rem'
                    }}
                  >
                    变更
                  </Button>
                </div>
                <div className='w-[300px] text-sm flex items-center'>
                  <span className='text-[var(--color-text-3)]'>
                    上级分销员：
                  </span>
                  <span>{data.superior_distributors || '-'}</span>
                </div>
              </div>
              <div className='mt-5 flex flex-wrap gap-y-5'>
                <div className='w-[300px] text-sm'>
                  <span className='text-[var(--color-text-3)]'>创建时间：</span>
                  <span>{data.ctime ? formatDateTime(data.ctime) : '-'}</span>
                </div>
                <div className='w-[300px] text-sm'>
                  <span className='text-[var(--color-text-3)]'>
                    最近浏览时间：
                  </span>
                  <span>
                    {data.browsing_ctime
                      ? formatDateTime(data.browsing_ctime)
                      : '-'}
                  </span>
                </div>
              </div>
              <div className='mt-5 flex flex-wrap gap-y-5'>
                <div className='text-sm'>
                  <span className='text-[var(--color-text-3)]'>
                    最近收货地址：
                  </span>
                  <span>{data.address?.trim() || '-'}</span>
                </div>
              </div>
              {data.label && (
                <div className='mt-5 flex flex-wrap gap-y-5'>
                  <div className='flex items-start text-sm space-x-2'>
                    <span className='flex-none text-[var(--color-text-3)]'>
                      客户标签：
                    </span>
                    <span className='inline-flex flex-wrap gap-2'>
                      {data.label.split(',').map((tag, index) => (
                        <MyTag key={index} text={tag} />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
      <div className='rounded-md bg-white mt-4'>
        <Tabs>
          <Tabs.TabPane key='overview' title='客户概览'>
            <div className='px-4 pb-6'>
              <Overview />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key='transaction-detail' title='交易明细'>
            <div className='px-4 pb-6'></div>
          </Tabs.TabPane>
          <Tabs.TabPane key='coupon-detail' title='优惠券明细'>
            <div className='px-4 pb-6'></div>
          </Tabs.TabPane>
          <Tabs.TabPane key='behavior-record' title='行为记录'>
            <div className='px-4 pb-6'></div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  )
}
