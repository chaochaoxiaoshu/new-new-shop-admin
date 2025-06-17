import { type } from 'arktype'

import { createFileRoute } from '@tanstack/react-router'

import { getCustomers } from '@/api/customers/get-customers'
import { MyTable } from '@/components/my-table'
import { TableLayout } from '@/components/table-layout'
import { queryClient } from '@/lib'
import { useUserStore } from '@/stores'

const CustomersSearchSchema = type({
  'mobile?': 'string',
  'nickname?': 'string',
  page_index: ['number', '=', 1],
  page_size: ['number', '=', 10]
})

function getCustomersQueryOptions(search: typeof CustomersSearchSchema.infer) {
  return {
    queryKey: ['customers', search],
    queryFn: () =>
      getCustomers({
        page_index: search.page_index,
        page_size: search.page_size,
        with_fields: ['all'],
        department: useUserStore.getState().departmentId!
      })
  }
}

export const Route = createFileRoute('/_protected/client/account/')({
  validateSearch: CustomersSearchSchema,
  loader: () => {
    return queryClient.ensureQueryData(
      getCustomersQueryOptions({
        page_index: 1,
        page_size: 10
      })
    )
  },
  component: CustomersView
})

function CustomersView() {
  return (
    <TableLayout>
      <MyTable />
    </TableLayout>
  )
}
