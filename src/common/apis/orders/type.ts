export interface OrderListRequestData {
  orderNo?: string
  status?: string
  userId?: number
  username?: string
  page?: number
  pageSize?: number
}

export interface OrderListItem {
  id: number
  order_no: string
  user_id: number
  username: string
  nickname: string
  email: string
  order_type: string
  package_id: string
  package_name: string
  amount: number
  points: number
  status: string
  payment_channel: string
  third_party_order_no: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: number
  order_id: number
  user_id: number
  channel: string
  transaction_type: string
  trade_no: string | null
  status: string
  request_data: unknown
  response_data: unknown
  callback_data: unknown
  created_at: string
  updated_at: string
}

export type OrderListResponseData = ApiResponseData<{
  total: number
  list: OrderListItem[]
  page: number
  pageSize: number
  totalPages: number
}>

export type OrderDetailResponseData = ApiResponseData<{
  order: OrderListItem & {
    phone: string
    current_points: number
  }
  transactions: PaymentTransaction[]
}>
