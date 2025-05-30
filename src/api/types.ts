export type ApiResponse<T> = {
  errcode: number
  errmsg: string
  ts: string
  result: T
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  paginate: Pagination
}>

export type Pagination = {
  page_index: number
  page_size: number
  total: number
}

export type PaginatedReq = {
  page_index?: number
  page_size?: number
}

export type Partial<T> = T extends object
  ? {
      [P in keyof T]?: Partial<T[P]>
    }
  : T
