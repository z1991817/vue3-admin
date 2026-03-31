import type { OrderListItem } from "@/common/apis/orders/type"

export interface CustomerListRequestData {
  username?: string
  status?: number
  page?: number
  pageSize?: number
}

export interface CustomerListItem {
  id: number
  username: string
  email: string
  phone: string
  nickname: string
  avatar: string
  points: number
  status: number
  created_at: string
  updated_at: string
  total_recharge_amount: number
  total_recharge_points: number
  last_paid_at: string | null
}

export interface PointsLogItem {
  id: number
  user_id: number
  username: string
  nickname: string
  change_type: string
  change_amount: number
  balance_after: number
  order_id: number | null
  remark: string | null
  created_at: string
}

export interface CustomerDetailData {
  user: {
    id: number
    username: string
    email: string
    phone: string
    nickname: string
    avatar: string
    points: number
    status: number
    created_at: string
    updated_at: string
  }
  totalRechargeAmount: number
  totalRechargePoints: number
  recentOrders: OrderListItem[]
  recentPointsLogs: PointsLogItem[]
}

export interface CustomerPointsLogsRequestData {
  page?: number
  pageSize?: number
  changeType?: string
}

export interface CustomerRechargeRequestData {
  points: number
}

export type CustomerListResponseData = ApiResponseData<{
  total: number
  page: number
  limit: number
  data: CustomerListItem[]
}>

export type CustomerDetailResponseData = ApiResponseData<CustomerDetailData>

export type CustomerPointsLogsResponseData = ApiResponseData<{
  total: number
  list: PointsLogItem[]
  page: number
  pageSize: number
  totalPages: number
}>

export type CustomerRechargeResponseData = ApiResponseData<any>
