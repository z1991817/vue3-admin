import type * as Orders from "./type"
import { request } from "@/http/axios"

export function getOrderListApi(params: Orders.OrderListRequestData) {
  return request<Orders.OrderListResponseData>({
    url: "admin/orders",
    method: "get",
    params
  })
}

export function getOrderDetailApi(id: number | string) {
  return request<Orders.OrderDetailResponseData>({
    url: `admin/orders/${id}`,
    method: "get"
  })
}
