import { Button, Input, Select, Tabs } from '@arco-design/web-react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation
} from '@tanstack/react-router'
import { type } from 'arktype'
import { RotateCcw, Search, Smartphone } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Show } from '@/components/show'
import { TableLayout } from '@/components/table-layout'

export const Route = createFileRoute('/_protected/marketing/drp/userIndex')({
  validateSearch: type({
    'first_distributors?': 'string',
    'superior_distributor?': 'string',
    'examine?': '1 | 2 | 3',
    page_index: 'number = 1',
    page_size: 'number = 20'
  }),
  beforeLoad: ({ location }) => {
    if (location.pathname === '/newmanage/marketing/drp/userIndex') {
      throw redirect({ to: '/marketing/drp/userIndex/distributors' })
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const location = useLocation()

  const isApproval = location.pathname.includes('/approval')

  const { control, handleSubmit, reset } = useForm({
    defaultValues: search
  })

  const handleTabChange = (tabKey: 'distributors' | 'approval') => {
    if (tabKey === 'distributors') {
      navigate({ to: '/marketing/drp/userIndex/distributors' })
    } else {
      navigate({ to: '/marketing/drp/userIndex/approval' })
    }
    reset()
  }

  return (
    <TableLayout
      header={
        <div className='flex flex-col'>
          <form
            className='table-header'
            onSubmit={handleSubmit((values) =>
              navigate({
                to: isApproval
                  ? '/marketing/drp/userIndex/approval'
                  : '/marketing/drp/userIndex/distributors',
                search: values
              })
            )}
            onReset={() => {
              reset()
              navigate({
                to: isApproval
                  ? '/marketing/drp/userIndex/approval'
                  : '/marketing/drp/userIndex/distributors',
                search: {
                  page_index: search.page_index,
                  page_size: search.page_size
                }
              })
            }}
          >
            <Controller
              control={control}
              name='first_distributors'
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder='请输入分销员手机号'
                  style={{ width: 264 }}
                  suffix={<Smartphone className='inline size-4' />}
                />
              )}
            />
            <Controller
              control={control}
              name='superior_distributor'
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder='请输入上级分销员手机号'
                  style={{ width: 264 }}
                  suffix={<Smartphone className='inline size-4' />}
                />
              )}
            />
            <Show when={isApproval}>
              <Controller
                control={control}
                name='examine'
                render={({ field }) => (
                  <Select
                    {...field}
                    style={{ width: 264 }}
                    placeholder='请选择审核状态'
                  >
                    <Select.Option value={1}>待审核</Select.Option>
                    <Select.Option value={2}>审核通过</Select.Option>
                    <Select.Option value={3}>审核拒绝</Select.Option>
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
          </form>
          <Tabs
            className='mt-4'
            activeTab={isApproval ? 'approval' : 'distributors'}
            onChange={(key) =>
              handleTabChange(key as 'distributors' | 'approval')
            }
          >
            <Tabs.TabPane key='distributors' title='分销员列表' />
            <Tabs.TabPane key='approval' title='分销员审核' />
          </Tabs>
        </div>
      }
    >
      <Outlet />
    </TableLayout>
  )
}
