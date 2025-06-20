import { type } from 'arktype'
import { Search } from 'lucide-react'
import { useState } from 'react'

import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  Message,
  Radio,
  Tabs
} from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  bindDistributor,
  getCustomerInfo,
  getCustomerProfile,
  getCustomerPromotion,
  getCustomerProperty,
  getCustomers,
  registerDistributor,
  unbindDistributor,
  unregisterDistributor
} from '@/api'
import { BaseLayout } from '@/components/base-layout'
import { MyTag } from '@/components/my-tag'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
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
  const [openModal, contextHolder] = useMyModal()
  const { data } = useSuspenseQuery(context.customerInfoQueryOptions)

  const handleChangeCustomerIdentity = () => {
    const modalIns = openModal({
      title: '变更客户身份',
      content: (
        <ChangeCustomerIdentityForm
          currentIdentity={data.identity!}
          mobile={data.mobile}
          onSuccess={async () => {
            await queryClient.invalidateQueries(
              context.customerInfoQueryOptions
            )
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      )
    })
  }

  const handleChangeBindDistributor = () => {
    const modalIns = openModal({
      title: '变更归属分销员',
      content: (
        <ChangeBindDistributorForm
          onSuccess={async () => {
            await queryClient.invalidateQueries(
              context.customerInfoQueryOptions
            )
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      )
    })
  }

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
                    onClick={handleChangeCustomerIdentity}
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
                    onClick={handleChangeBindDistributor}
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
      {contextHolder}
    </div>
  )
}

interface ChangeCustomerIdentityFormProps {
  currentIdentity: string
  mobile?: string
  onSuccess?: () => void
  onCancel?: () => void
}

function ChangeCustomerIdentityForm({
  currentIdentity,
  mobile,
  onSuccess,
  onCancel
}: ChangeCustomerIdentityFormProps) {
  const search = Route.useSearch()

  const {
    mutate: changeCustomerIdentityMutate,
    isPending: changeCustomerIdentityPending
  } = useMutation({
    mutationKey: ['change-customer-identity'],
    mutationFn: (values: { identity: string }) => {
      if (values.identity === '分销员') {
        if (!mobile) {
          throw new Error('手机号不能为空')
        }
        return registerDistributor({ mobile })
      } else {
        return unregisterDistributor({ id: search.id })
      }
    },
    ...getNotifs({
      key: 'change-customer-identity',
      onSuccess
    })
  })

  return (
    <Form
      initialValues={{
        identity: currentIdentity === '分销员' ? '普通客户' : '分销员'
      }}
      onSubmit={changeCustomerIdentityMutate}
    >
      <Form.Item field='identity' label='变更类型'>
        <Input readOnly />
      </Form.Item>
      <div className='flex justify-end items-center space-x-4 mt-6'>
        <Button onClick={onCancel}>取消</Button>
        <Button
          loading={changeCustomerIdentityPending}
          htmlType='submit'
          type='primary'
        >
          确定
        </Button>
      </div>
    </Form>
  )
}

const ChangeBindDistributorFormType = {
  change: 0,
  unbind: 1
} as const
type ChangeBindDistributorFormType =
  (typeof ChangeBindDistributorFormType)[keyof typeof ChangeBindDistributorFormType]

type ChangeBindFormData = {
  type: ChangeBindDistributorFormType
  user_id?: number
}

interface ChangeBindDistributorFormProps {
  onSuccess: () => void
  onCancel: () => void
}

function ChangeBindDistributorForm({
  onSuccess,
  onCancel
}: ChangeBindDistributorFormProps) {
  const search = Route.useSearch()

  const [searchText, setSearchText] = useState('')

  const { data: distributorsData, isFetching: distributorsFetching } = useQuery(
    {
      queryKey: ['customers', searchText],
      queryFn: () =>
        getCustomers({
          mobile: searchText,
          department: useUserStore.getState().departmentId!
        }),
      placeholderData: keepPreviousData,
      enabled: !!searchText
    }
  )

  const {
    mutate: changeBindDistributorMutate,
    isPending: changeBindDistributorPending
  } = useMutation({
    mutationKey: ['change-bind-distributor'],
    mutationFn: (values: ChangeBindFormData) => {
      if (
        values.type === ChangeBindDistributorFormType.change &&
        values.user_id
      ) {
        return bindDistributor({ id: search.id, user_id: values.user_id })
      } else {
        return unbindDistributor({ id: search.id })
      }
    },
    ...getNotifs({
      key: 'change-bind-distributor',
      onSuccess
    })
  })

  return (
    <Form<ChangeBindFormData>
      layout='vertical'
      initialValues={{
        type: ChangeBindDistributorFormType.change
      }}
      onSubmit={changeBindDistributorMutate}
    >
      <Form.Item field='type' label='操作类型'>
        <Radio.Group>
          <Radio value={ChangeBindDistributorFormType.change}>
            变更归属分销员
          </Radio>
          <Radio value={ChangeBindDistributorFormType.unbind}>解绑分销员</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {(values: ChangeBindFormData, form) => {
          if (values.type === ChangeBindDistributorFormType.change) {
            return (
              <>
                <Input
                  value={searchText}
                  placeholder='请输入分销员手机号'
                  suffix={<Search className='inline size-4' />}
                  onChange={(val) => setSearchText(val)}
                />
                <Radio.Group>
                  <List
                    loading={distributorsFetching}
                    style={{
                      marginTop: 16,
                      height: 'calc(100vh - 500px)',
                      overflowY: 'auto'
                    }}
                  >
                    {distributorsData?.items.map((item) => (
                      <List.Item
                        style={{
                          padding: '8px 16px',
                          border:
                            values.user_id === item.id
                              ? '2px solid var(--accent)'
                              : '2px solid transparent'
                        }}
                        onClick={() => {
                          if (item.is_promoter !== 1) {
                            Message.error({
                              content: '该用户不是分销员'
                            })
                            return
                          }
                          form.setFieldValue('user_id', item.id)
                        }}
                      >
                        <List.Item.Meta
                          key={item.id}
                          title={item.nickname}
                          avatar={
                            <Avatar>
                              <img src={item.avatar} alt='avatar' />
                            </Avatar>
                          }
                        />
                      </List.Item>
                    ))}
                  </List>
                </Radio.Group>
              </>
            )
          }
        }}
      </Form.Item>
      <div className='flex justify-end items-center space-x-4 mt-6'>
        <Button onClick={onCancel}>取消</Button>
        <Button
          loading={changeBindDistributorPending}
          htmlType='submit'
          type='primary'
        >
          确定
        </Button>
      </div>
    </Form>
  )
}
