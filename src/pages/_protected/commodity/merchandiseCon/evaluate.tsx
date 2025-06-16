import { type } from 'arktype'
import dayjs from 'dayjs'
import { RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'

import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Rate,
  Select,
  Spin,
  Switch
} from '@arco-design/web-react'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import {
  GetCommentsRes,
  getCommentDetail,
  getComments,
  getDepartments,
  replyComment,
  toggleCommentVisibility
} from '@/api'
import { MyImage } from '@/components/my-image'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { getHead, getNotifs } from '@/helpers'
import { useMyModal } from '@/hooks'
import {
  TableCellWidth,
  defineTableColumns,
  formatDateTime,
  queryClient
} from '@/lib'
import { useUserStore } from '@/stores'

const LIST_KEY = 'comments'

const CommentsSearchSchema = type({
  'goods_id?': 'number',
  'name?': 'string',
  'order_id?': 'string',
  'department?': 'number',
  'display?': '1 | 2',
  'start_time?': 'number',
  'end_time?': 'number',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

const departmentsQueryOptions = queryOptions({
  queryKey: ['departments'],
  queryFn: () =>
    getDepartments({
      pageIndex: 1,
      pageSize: 9999
    })
})

function getCommentsQueryOptions(search: typeof CommentsSearchSchema.infer) {
  const signedDepartment = useUserStore.getState().departmentId!
  return queryOptions({
    queryKey: [LIST_KEY, search],
    queryFn: () =>
      getComments({
        ...search,
        department:
          signedDepartment === 0 ? search.department : signedDepartment
      }),
    placeholderData: keepPreviousData
  })
}

export const Route = createFileRoute(
  '/_protected/commodity/merchandiseCon/evaluate'
)({
  head: () => getHead('商品评价'),
  validateSearch: CommentsSearchSchema,
  component: CommentsView,
  loader: () => {
    queryClient.prefetchQuery(departmentsQueryOptions)
    return queryClient.ensureQueryData(
      getCommentsQueryOptions({
        page_index: 1,
        page_size: 10
      })
    )
  }
})

function CommentsView() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const departmentId = useUserStore((store) => store.departmentId)
  const [openModal, contextHolder] = useMyModal()

  /* ------------------------------ Search START ------------------------------ */
  const [tempSearch, setTempSearch] = useState(search)

  const handleUpdateSearchParam = <
    K extends keyof typeof CommentsSearchSchema.infer
  >(
    key: K,
    value: (typeof CommentsSearchSchema.infer)[K]
  ) => {
    setTempSearch((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    navigate({ search: tempSearch })
  }

  const handleReset = () => {
    const initial = {
      page_index: search.page_index,
      page_size: search.page_size
    }
    navigate({ search: initial })
    setTempSearch(initial)
  }
  /* ------------------------------- Search END ------------------------------- */

  const { data: departments } = useQuery(departmentsQueryOptions)

  const { data, isFetching } = useQuery(getCommentsQueryOptions(search))

  const { mutate: handleToggleVisibility } = useMutation({
    mutationKey: ['toggle-comment-visibility'],
    mutationFn: (id?: number) => {
      return toggleCommentVisibility({ id: id! })
    },
    ...getNotifs({
      key: 'toggle-comment-visibility',
      onSuccess: () => {
        queryClient.invalidateQueries(getCommentsQueryOptions(search))
      }
    })
  })

  const handleReply = (id?: number) => {
    if (!id) return
    const modalIns = openModal({
      title: '回复评价',
      content: (
        <ReplyForm
          id={id}
          onSuccess={async () => {
            await queryClient.invalidateQueries({
              queryKey: [LIST_KEY]
            })
            modalIns?.close()
          }}
          onCancel={() => modalIns?.close()}
        />
      ),
      style: { width: 600 }
    })
  }

  const { columns, totalWidth } = defineTableColumns<GetCommentsRes>([
    {
      title: 'ID',
      dataIndex: 'id',
      width: TableCellWidth.id,
      fixed: 'left',
      align: 'center'
    },
    {
      title: '前台显示状态',
      render: (_, item) => (
        <Switch
          key={item.goods_id}
          checked={item.display === 1}
          checkedText='显示'
          uncheckedText='隐藏'
          onChange={() => handleToggleVisibility(item.id)}
        />
      ),
      width: 120,
      align: 'center'
    },
    {
      title: '用户',
      dataIndex: 'user_tel',
      width: 100,
      ellipsis: true,
      align: 'center'
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 220,
      ellipsis: true,
      align: 'center'
    },
    {
      title: '评价商品',
      dataIndex: 'name',
      width: 320,
      ellipsis: true
    },
    {
      title: '评价星数',
      dataIndex: 'score',
      width: TableCellWidth.count,
      align: 'center'
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      ellipsis: true
    },
    {
      title: '评价图片',
      render: (_, item) => (
        <MyImage
          key={item.goods_id}
          src={item.images?.split(',')[0]}
          width={40}
          height={40}
        />
      ),
      width: TableCellWidth.thumb,
      align: 'center'
    },
    {
      title: '评价时间',
      render: (_, item) => formatDateTime(item.ctime),
      width: TableCellWidth.datetime,
      align: 'center'
    },
    {
      title: '操作',
      render: (_, item) => (
        <div className='flex justify-center items-center'>
          <Button type='text' onClick={() => handleReply(item.id)}>
            回复评价
          </Button>
        </div>
      ),
      width: 120,
      fixed: 'right',
      align: 'center'
    }
  ])

  return (
    <TableLayout
      header={
        <TableLayout.Header>
          <Input
            value={tempSearch.name}
            placeholder='请输入商品名称'
            style={{ width: '264px' }}
            onChange={(value) => handleUpdateSearchParam('name', value)}
          />
          <Input
            value={tempSearch.order_id}
            placeholder='请输入订单号'
            style={{ width: '264px' }}
            onChange={(value) => handleUpdateSearchParam('order_id', value)}
          />
          {departmentId === 0 && (
            <Select
              value={tempSearch.department}
              placeholder='请选择电商事业部'
              style={{ width: '264px' }}
              onChange={(value) => handleUpdateSearchParam('department', value)}
            >
              {departments?.items.map((item) => (
                <Select.Option key={item.id} value={item.id!}>
                  {item.department_name}
                </Select.Option>
              ))}
            </Select>
          )}
          <Select
            value={tempSearch.display}
            placeholder='请选择显示状态'
            style={{ width: '264px' }}
            onChange={(value) => handleUpdateSearchParam('display', value)}
          >
            <Select.Option value={1}>显示</Select.Option>
            <Select.Option value={2}>隐藏</Select.Option>
          </Select>
          <DatePicker.RangePicker
            value={
              tempSearch.start_time && tempSearch.end_time
                ? [
                    dayjs.unix(tempSearch.start_time),
                    dayjs.unix(tempSearch.end_time)
                  ]
                : undefined
            }
            style={{ width: '264px' }}
            onChange={(value) => {
              handleUpdateSearchParam('start_time', dayjs(value?.[0]).unix())
              handleUpdateSearchParam('end_time', dayjs(value?.[1]).unix())
            }}
            onClear={() => {
              handleUpdateSearchParam('start_time', undefined)
              handleUpdateSearchParam('end_time', undefined)
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
        </TableLayout.Header>
      }
    >
      <MyTable
        rowKey='id'
        data={data?.items ?? []}
        columns={columns}
        loading={isFetching}
        scroll={{ x: totalWidth + 320 }}
        pagination={{
          current: data?.paginate.page_index,
          pageSize: data?.paginate.page_size,
          total: data?.paginate.total,
          onChange: (current, pageSize) => {
            navigate({
              search: {
                ...search,
                page_index: current,
                page_size: pageSize
              }
            })
          }
        }}
      />
      {contextHolder}
    </TableLayout>
  )
}

interface ReplyFormValues {
  seller_content: string
}

interface ReplyFormProps {
  id: number
  onSuccess?: () => Promise<void> | void
  onCancel?: () => void
  onError?: (error: Error) => void
}

function ReplyForm(props: ReplyFormProps) {
  const { id, onSuccess, onCancel, onError } = props

  const { data: comment, isPending: commentPending } = useQuery({
    queryKey: ['comment-detail', id],
    queryFn: () => getCommentDetail({ id: id! })
  })

  const [form] = Form.useForm<ReplyFormValues>()

  const { mutate: handleSubmit, isPending: submitPending } = useMutation({
    mutationKey: ['reply-comment', id],
    mutationFn: (values: ReplyFormValues) => {
      return replyComment({ id: id!, seller_content: values.seller_content })
    },
    ...getNotifs({ key: 'reply-comment', onSuccess }),
    onError
  })

  return (
    <div className='flex flex-col'>
      <Spin loading={commentPending}>
        <Descriptions
          data={[
            { label: '用户评价：', value: comment?.content || '-' },
            {
              label: '用户评分：',
              value: <Rate value={comment?.score || 0} readonly />
            },
            { label: '商家回复：', value: '' }
          ]}
          column={1}
        />
      </Spin>
      <Form
        form={form}
        disabled={submitPending}
        layout='vertical'
        labelAlign='left'
        onSubmit={handleSubmit}
      >
        <Form.Item
          field='seller_content'
          rules={[{ required: true, message: '请输入商家回复' }]}
        >
          <Input.TextArea placeholder='请输入商家回复' />
        </Form.Item>
        <div className='flex justify-end items-center space-x-4 mt-6'>
          <Button onClick={onCancel}>取消</Button>
          <Button loading={submitPending} htmlType='submit' type='primary'>
            确定
          </Button>
        </div>
      </Form>
    </div>
  )
}
