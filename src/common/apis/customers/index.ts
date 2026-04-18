import type * as Customers from "./type"
import { request } from "@/http/axios"

export function getCustomerListApi(params: Customers.CustomerListRequestData) {
  return request<Customers.CustomerListResponseData>({
    url: "admin/customers",
    method: "get",
    params
  })
}

export function getCustomerDetailApi(id: number | string) {
  return request<Customers.CustomerDetailResponseData>({
    url: `admin/customers/${id}`,
    method: "get"
  })
}

export function getCustomerPointsLogsApi(id: number | string, params: Customers.CustomerPointsLogsRequestData) {
  return request<Customers.CustomerPointsLogsResponseData>({
    url: `admin/customers/${id}/points-logs`,
    method: "get",
    params
  })
}

export function rechargeCustomerApi(id: number | string, data: Customers.CustomerRechargeRequestData) {
  return request<Customers.CustomerRechargeResponseData>({
    url: `admin/customers/${id}/recharge`,
    method: "post",
    data
  })
}

export function resetCustomerPasswordApi(id: number | string, data: Customers.CustomerResetPasswordRequestData) {
  return request<Customers.CustomerResetPasswordResponseData>({
    url: `admin/customers/${id}/password`,
    method: "post",
    data
  })
}
